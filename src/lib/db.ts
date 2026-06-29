import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { formatFollowUpDateAr } from "./utils";
import type { TrackingData } from "./tracking";
import type { InquiryStatus } from "./types";
import {
  defaultBranches,
  defaultClinicSettings,
  defaultCustomerSources,
  defaultDoctorsSeed,
  defaultServices,
  type ClinicSettings,
  type DbBranch,
  type DbCustomerSource,
  type DbService,
} from "./clinic-types";
import {
  defaultStoreOrders,
  defaultStorePayments,
  defaultStoreProducts,
  type StoreOrder,
  type StorePayment,
  type StoreProduct,
} from "./store-types";
import type {
  CampaignStats,
  CampaignStatsFilters,
  CampaignVisit,
  DbCampaign,
} from "./campaign-types";
import { slugifyCampaignCode } from "./campaign-types";
import { validateLogoDataUrl } from "./security";
import { CLINIC_PHONE } from "./site-config";

export type UserRole = "admin" | "employee" | "secretary";

export interface DbUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  /** Secretary accounts — linked doctor */
  linkedDoctorId?: string;
  createdAt: string;
  /** Bumped on password change / forced logout — invalidates JWT sessions */
  sessionVersion?: number;
}

export interface InquiryMeta {
  whatHappened?: string;
  nextAction?: string;
  goal?: string;
  doctor?: string;
  satisfaction?: number;
  failReason?: string;
  noShow?: boolean;
  assignedStaff?: string;
  duration?: string;
  gender?: string;
  age?: string;
  address?: string;
  email?: string;
  phoneExtra1?: string;
  phoneExtra2?: string;
  phoneExtra3?: string;
  preferredPhone?: "primary" | "extra1" | "extra2" | "extra3";
  clientNotes?: string;
}

export interface DbInquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  note: string;
  service: string;
  branch: string;
  nextFollowUp: string;
  meta?: InquiryMeta;
  tracking?: TrackingData;
  assignedTo: string;
  /** User id of assigned secretary */
  assignedSecretary: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpLog {
  id: string;
  inquiryId: string;
  status: InquiryStatus;
  note: string;
  nextFollowUp: string;
  changes: { field: string; fieldLabel: string; from: string; to: string }[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface DbDoctor {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  workingHours: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface Database {
  users: DbUser[];
  inquiries: DbInquiry[];
  followUpLogs: FollowUpLog[];
  doctors: DbDoctor[];
  clinicSettings: ClinicSettings;
  branches: DbBranch[];
  services: DbService[];
  customerSources: DbCustomerSource[];
  storeProducts: StoreProduct[];
  storePayments: StorePayment[];
  storeOrders: StoreOrder[];
  campaigns: DbCampaign[];
  campaignVisits: CampaignVisit[];
}

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

/** In-memory cache — prevents re-reading/writing db.json on every API call (which triggers HMR reload loops) */
let dbCache: Database | null = null;

const FIELD_LABELS: Record<string, string> = {
  name: "الاسم",
  phone: "الهاتف",
  status: "الحالة",
  note: "ملاحظة",
  service: "الخدمة",
  branch: "الفرع",
  nextFollowUp: "المتابعة التالية",
  message: "الرسالة",
  assignedTo: "الطبيب المخصص",
  assignedSecretary: "السكرتير المعيّن",
};

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  followup: "متابعة",
  booked: "محجوز",
  attended: "حضر",
  failed: "فشل",
};

function formatValue(field: string, value: string): string {
  if (field === "status") return STATUS_LABELS[value] || value || "—";
  if (field === "assignedTo") {
    if (!value) return "غير معين";
    const doctor = ensureDb().doctors.find((d) => d.id === value);
    return doctor?.name || value;
  }
  if (field === "assignedSecretary") {
    if (!value) return "غير معيّن";
    const user = ensureDb().users.find((u) => u.id === value);
    return user?.name || value;
  }
  return value || "—";
}

function migrateDb(raw: Partial<Database>): Database {
  const inquiries = (raw.inquiries || []).map((inq) => ({
    ...inq,
    assignedTo: inq.assignedTo ?? "",
    assignedSecretary: inq.assignedSecretary ?? "",
    tracking: inq.tracking ?? {},
  }));

  const users = (raw.users || []).map((u) => ({
    ...u,
    linkedDoctorId: u.linkedDoctorId ?? "",
    sessionVersion: u.sessionVersion ?? 0,
  }));

  const doctors = (raw.doctors || []).map((d) => ({
    ...d,
    email: d.email ?? "",
    status: d.status ?? "active",
  }));

  let branches = raw.branches?.length ? raw.branches : defaultBranches();
  let services = raw.services?.length ? raw.services : defaultServices();
  let customerSources = raw.customerSources?.length
    ? raw.customerSources
    : defaultCustomerSources();
  const clinicSettings = {
    ...defaultClinicSettings(),
    ...(raw.clinicSettings || {}),
    phone: CLINIC_PHONE,
    tagline: raw.clinicSettings?.tagline ?? defaultClinicSettings().tagline,
    social: {
      ...defaultClinicSettings().social,
      ...(raw.clinicSettings?.social || {}),
    },
    workingHours: {
      ...defaultClinicSettings().workingHours,
      ...(raw.clinicSettings?.workingHours || {}),
    },
  };

  const storeProducts = raw.storeProducts?.length ? raw.storeProducts : defaultStoreProducts();
  const storePayments = raw.storePayments?.length ? raw.storePayments : defaultStorePayments();
  const storeOrders = raw.storeOrders?.length ? raw.storeOrders : defaultStoreOrders();
  const campaigns = raw.campaigns || [];
  const campaignVisits = raw.campaignVisits || [];

  if (!raw.doctors?.length) {
    const now = new Date().toISOString();
    doctors.push(
      ...defaultDoctorsSeed().map((d, i) => ({
        id: `doc-seed-${i + 1}`,
        name: d.name,
        specialty: d.specialty,
        branch: d.branch,
        workingHours: "9:00 AM - 5:00 PM",
        phone: "",
        email: "",
        status: "active" as const,
        createdAt: now,
      }))
    );
  }

  return {
    users,
    inquiries,
    followUpLogs: raw.followUpLogs || [],
    doctors,
    clinicSettings,
    branches,
    services,
    customerSources,
    storeProducts,
    storePayments,
    storeOrders,
    campaigns,
    campaignVisits,
  };
}

function ensureDb(): Database {
  if (dbCache) return dbCache;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    if (process.env.NODE_ENV === "production" && !process.env.INITIAL_ADMIN_PASSWORD?.trim()) {
      throw new Error(
        "INITIAL_ADMIN_PASSWORD must be set for first production deployment (min 10 characters)"
      );
    }
    const initialPassword =
      process.env.INITIAL_ADMIN_PASSWORD?.trim() ||
      (process.env.NODE_ENV === "production" ? "" : "admin123");
    if (initialPassword.length < 10 && process.env.NODE_ENV === "production") {
      throw new Error("INITIAL_ADMIN_PASSWORD must be at least 10 characters");
    }
    const adminHash = bcrypt.hashSync(initialPassword, 12);
    const initial: Database = {
      users: [
        {
          id: "admin-1",
          username: "admin",
          passwordHash: adminHash,
          name: "مدير النظام",
          role: "admin",
          createdAt: new Date().toISOString(),
          sessionVersion: 0,
        },
      ],
      inquiries: [],
      followUpLogs: [],
      doctors: defaultDoctorsSeed().map((d, i) => ({
        id: `doc-seed-${i + 1}`,
        name: d.name,
        specialty: d.specialty,
        branch: d.branch,
        workingHours: "9:00 AM - 5:00 PM",
        phone: "",
        email: "",
        status: "active" as const,
        createdAt: new Date().toISOString(),
      })),
      clinicSettings: defaultClinicSettings(),
      branches: defaultBranches(),
      services: defaultServices(),
      customerSources: defaultCustomerSources(),
      storeProducts: defaultStoreProducts(),
      storePayments: defaultStorePayments(),
      storeOrders: defaultStoreOrders(),
      campaigns: [],
      campaignVisits: [],
    };
    dbCache = initial;
    saveDb(initial);
    return initial;
  }

  let raw: Partial<Database>;
  try {
    raw = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    throw new Error("Database file is corrupted. Restore data/db.json from backup.");
  }

  const db = migrateDb(raw);
  dbCache = db;

  // Persist only when new schema fields are missing (one-time migration)
  const needsMigrationSave =
    !Array.isArray(raw.campaigns) ||
    !Array.isArray(raw.campaignVisits) ||
    !raw.clinicSettings;

  if (needsMigrationSave) {
    saveDb(db);
  }

  return db;
}

function saveDb(db: Database) {
  dbCache = db;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function detectChanges(
  before: DbInquiry,
  after: Partial<DbInquiry>
): { field: string; fieldLabel: string; from: string; to: string }[] {
  const changes: { field: string; fieldLabel: string; from: string; to: string }[] = [];
  for (const key of Object.keys(after) as (keyof DbInquiry)[]) {
    if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "meta" || key === "tracking") continue;
    const from = String(before[key] ?? "");
    const to = String(after[key] ?? "");
    if (from !== to) {
      changes.push({
        field: key,
        fieldLabel: FIELD_LABELS[key] || key,
        from: formatValue(key, from),
        to: formatValue(key, to),
      });
    }
  }
  return changes;
}

export function addFollowUpLog(data: {
  inquiryId: string;
  status: InquiryStatus;
  note: string;
  nextFollowUp: string;
  changes: FollowUpLog["changes"];
  createdBy: string;
  createdByName: string;
}): FollowUpLog {
  const db = ensureDb();
  const log: FollowUpLog = {
    id: `log-${Date.now()}`,
    inquiryId: data.inquiryId,
    status: data.status,
    note: data.note,
    nextFollowUp: data.nextFollowUp,
    changes: data.changes,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: new Date().toISOString(),
  };
  db.followUpLogs.unshift(log);
  saveDb(db);
  return log;
}

export function getFollowUpLogs(inquiryId: string): FollowUpLog[] {
  return ensureDb()
    .followUpLogs.filter((l) => l.inquiryId === inquiryId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function countFollowUps(inquiryId: string): number {
  return ensureDb().followUpLogs.filter((l) => l.inquiryId === inquiryId).length;
}

export function getAllInquiries(): DbInquiry[] {
  const db = ensureDb();
  return db.inquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getInquiryById(id: string): DbInquiry | undefined {
  return ensureDb().inquiries.find((i) => i.id === id);
}

export function deleteInquiries(ids: string[]): number {
  const db = ensureDb();
  const idSet = new Set(ids);
  const before = db.inquiries.length;
  db.inquiries = db.inquiries.filter((i) => !idSet.has(i.id));
  db.followUpLogs = db.followUpLogs.filter((l) => !idSet.has(l.inquiryId));
  saveDb(db);
  return before - db.inquiries.length;
}

export type AppointmentBulkStatus = "scheduled" | "completed" | "no_show" | "cancelled";

export function bulkSetAppointmentStatus(
  ids: string[],
  statusType: AppointmentBulkStatus,
  actor: { id: string; name: string }
): number {
  const statusMap: Record<
    AppointmentBulkStatus,
    { status: InquiryStatus; meta?: Partial<InquiryMeta> }
  > = {
    scheduled: { status: "booked", meta: { noShow: false } },
    completed: { status: "attended", meta: { noShow: false } },
    no_show: { status: "failed", meta: { noShow: true } },
    cancelled: { status: "failed", meta: { noShow: false } },
  };
  const target = statusMap[statusType];
  let count = 0;
  for (const id of ids) {
    const inquiry = getInquiryById(id);
    if (!inquiry) continue;
    const updated = updateInquiry(
      id,
      {
        status: target.status,
        meta: { ...inquiry.meta, ...target.meta },
      },
      actor
    );
    if (updated) count++;
  }
  return count;
}

export function createInquiry(data: {
  name: string;
  phone: string;
  message: string;
  branch?: string;
  service?: string;
  tracking?: TrackingData;
}): DbInquiry {
  const db = ensureDb();
  const now = new Date().toISOString();
  const inquiry: DbInquiry = {
    id: `inq-${Date.now()}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    message: data.message.trim(),
    status: "new",
    note: data.message.trim() || "",
    service: data.service?.trim() || "",
    branch: data.branch || "",
    nextFollowUp: "",
    tracking: data.tracking || {},
    assignedTo: "",
    assignedSecretary: "",
    createdAt: now,
    updatedAt: now,
  };
  const log: FollowUpLog = {
    id: `log-${Date.now()}`,
    inquiryId: inquiry.id,
    status: "new",
    note: inquiry.note,
    nextFollowUp: "",
    changes: [{ field: "created", fieldLabel: "إنشاء", from: "—", to: "طلب جديد" }],
    createdBy: "system",
    createdByName: "النظام",
    createdAt: now,
  };
  db.inquiries.unshift(inquiry);
  db.followUpLogs.unshift(log);
  saveDb(db);
  return inquiry;
}

export function updateInquiry(
  id: string,
  updates: Partial<Omit<DbInquiry, "id" | "createdAt">>,
  actor?: { id: string; name: string }
): DbInquiry | null {
  const db = ensureDb();
  const idx = db.inquiries.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  const definedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<DbInquiry, "id" | "createdAt">>;

  if (Object.keys(definedUpdates).length === 0) {
    return db.inquiries[idx];
  }

  const before = { ...db.inquiries[idx] };
  const changes = detectChanges(before, definedUpdates);

  db.inquiries[idx] = {
    ...db.inquiries[idx],
    ...definedUpdates,
    updatedAt: new Date().toISOString(),
  };

  if (changes.length > 0 && actor) {
    db.followUpLogs.unshift({
      id: `log-${Date.now()}`,
      inquiryId: id,
      status: db.inquiries[idx].status,
      note: db.inquiries[idx].note,
      nextFollowUp: db.inquiries[idx].nextFollowUp,
      changes,
      createdBy: actor.id,
      createdByName: actor.name,
      createdAt: new Date().toISOString(),
    });
  }
  saveDb(db);

  return db.inquiries[idx];
}

function resolveDoctorIdByName(name: string): string {
  if (!name?.trim()) return "";
  const doctor = ensureDb().doctors.find((d) => d.name === name.trim());
  return doctor?.id ?? "";
}

export function createFollowUpEntry(
  inquiryId: string,
  data: {
    status: InquiryStatus;
    note: string;
    nextFollowUp: string;
    service?: string;
    branch?: string;
    meta?: InquiryMeta;
    assignedTo?: string;
  },
  actor: { id: string; name: string }
): { inquiry: DbInquiry; log: FollowUpLog } | null {
  let assignedTo = data.assignedTo;
  if (data.meta?.doctor?.trim()) {
    const byName = resolveDoctorIdByName(data.meta.doctor);
    if (byName) assignedTo = byName;
  }

  const inquiry = updateInquiry(
    inquiryId,
    {
      status: data.status,
      note: data.note,
      nextFollowUp: data.nextFollowUp,
      service: data.service,
      branch: data.branch,
      meta: data.meta,
      ...(assignedTo !== undefined && assignedTo !== null ? { assignedTo } : {}),
    },
    actor
  );
  if (!inquiry) return null;
  const log = getFollowUpLogs(inquiryId)[0];
  return { inquiry, log };
}

export function getUserByUsername(username: string): DbUser | undefined {
  return ensureDb().users.find((u) => u.username === username);
}

export function getUserById(id: string): DbUser | undefined {
  return ensureDb().users.find((u) => u.id === id);
}

export function userExists(id: string): boolean {
  return ensureDb().users.some((u) => u.id === id);
}

export function getUserSessionVersion(id: string): number {
  const user = getUserById(id);
  return user?.sessionVersion ?? 0;
}

function bumpSessionVersion(user: DbUser): void {
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
}

export function getAllUsers(): Omit<DbUser, "passwordHash">[] {
  return ensureDb().users.map(({ passwordHash: _, ...u }) => u);
}

export function createUser(data: {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  linkedDoctorId?: string;
}): Omit<DbUser, "passwordHash"> {
  const db = ensureDb();
  if (db.users.some((u) => u.username === data.username)) {
    throw new Error("اسم المستخدم موجود مسبقاً");
  }
  const user: DbUser = {
    id: `user-${Date.now()}`,
    username: data.username,
    passwordHash: bcrypt.hashSync(data.password, 12),
    name: data.name,
    role: data.role,
    linkedDoctorId: data.linkedDoctorId?.trim() || "",
    createdAt: new Date().toISOString(),
    sessionVersion: 0,
  };
  db.users.push(user);
  saveDb(db);
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function deleteUser(id: string): boolean {
  const db = ensureDb();
  const user = db.users.find((u) => u.id === id);
  if (!user || user.role === "admin") return false;
  db.users = db.users.filter((u) => u.id !== id);
  db.inquiries.forEach((inq) => {
    if (inq.assignedSecretary === id) inq.assignedSecretary = "";
  });
  saveDb(db);
  return true;
}

export function updateUser(
  id: string,
  updates: {
    name?: string;
    username?: string;
    password?: string;
    linkedDoctorId?: string;
  }
): Omit<DbUser, "passwordHash"> | null {
  const db = ensureDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  const user = db.users[idx];
  if (updates.username !== undefined && updates.username.trim() !== user.username) {
    const taken = db.users.some(
      (u) => u.id !== id && u.username === updates.username!.trim()
    );
    if (taken) throw new Error("اسم المستخدم موجود مسبقاً");
    user.username = updates.username.trim();
  }
  if (updates.name !== undefined) user.name = updates.name.trim();
  if (updates.linkedDoctorId !== undefined) {
    user.linkedDoctorId = updates.linkedDoctorId.trim();
  }
  if (updates.password !== undefined && updates.password.length > 0) {
    if (updates.password.length < 8) {
      throw new Error("كلمة المرور 8 أحرف على الأقل");
    }
    user.passwordHash = bcrypt.hashSync(updates.password, 12);
    bumpSessionVersion(user);
  }

  saveDb(db);
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): boolean {
  const user = getUserById(userId);
  if (!user || !verifyPassword(user, currentPassword)) {
    throw new Error("كلمة المرور الحالية غير صحيحة");
  }
  if (newPassword.length < 8) {
    throw new Error("كلمة المرور الجديدة 8 أحرف على الأقل");
  }
  updateUser(userId, { password: newPassword });
  return true;
}

export function getSecretaries(): Omit<DbUser, "passwordHash">[] {
  return getAllUsers().filter((u) => u.role === "secretary");
}

/** Staff who can receive customer assignments (employees + secretaries) */
export function getAssignableStaff(): Omit<DbUser, "passwordHash">[] {
  return getAllUsers().filter((u) => u.role === "employee" || u.role === "secretary");
}

export function isAssigneeStaff(role: UserRole): boolean {
  return role === "employee" || role === "secretary";
}

export function getInquiriesForRole(
  role: UserRole,
  userId: string
): DbInquiry[] {
  const all = getAllInquiries();
  if (isAssigneeStaff(role)) {
    return all.filter((i) => i.assignedSecretary === userId);
  }
  return all;
}

export function canStaffAccessInquiry(
  role: UserRole,
  userId: string,
  inquiry: DbInquiry
): boolean {
  if (!isAssigneeStaff(role)) return true;
  return inquiry.assignedSecretary === userId;
}

/** @deprecated use canStaffAccessInquiry */
export function canSecretaryAccessInquiry(
  role: UserRole,
  userId: string,
  inquiry: DbInquiry
): boolean {
  return canStaffAccessInquiry(role, userId, inquiry);
}

export function verifyPassword(user: DbUser, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function getAllDoctors(): DbDoctor[] {
  return ensureDb().doctors.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createDoctor(data: {
  name: string;
  specialty: string;
  branch: string;
  workingHours: string;
  phone?: string;
  email?: string;
  status?: "active" | "inactive";
}): DbDoctor {
  const db = ensureDb();
  const doctor: DbDoctor = {
    id: `doc-${Date.now()}`,
    name: data.name.trim(),
    specialty: data.specialty.trim(),
    branch: data.branch.trim(),
    workingHours: data.workingHours.trim(),
    phone: data.phone?.trim() || "",
    email: data.email?.trim() || "",
    status: data.status || "active",
    createdAt: new Date().toISOString(),
  };
  db.doctors.push(doctor);
  saveDb(db);
  return doctor;
}

export function updateDoctor(
  id: string,
  updates: Partial<Omit<DbDoctor, "id" | "createdAt">>
): DbDoctor | null {
  const db = ensureDb();
  const idx = db.doctors.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  db.doctors[idx] = { ...db.doctors[idx], ...updates };
  saveDb(db);
  return db.doctors[idx];
}

export function deleteDoctor(id: string): boolean {
  const db = ensureDb();
  const before = db.doctors.length;
  db.doctors = db.doctors.filter((d) => d.id !== id);
  if (db.doctors.length === before) return false;
  saveDb(db);
  return true;
}

// ─── Clinic management ───

export function getClinicSettings(): ClinicSettings {
  const settings = ensureDb().clinicSettings;
  return { ...settings, phone: CLINIC_PHONE, whatsapp: "" };
}

export function updateClinicSettings(updates: Partial<ClinicSettings>): ClinicSettings {
  const db = ensureDb();
  const next = { ...updates };
  if (next.logo !== undefined) {
    next.logo = validateLogoDataUrl(next.logo) ?? "";
  }
  db.clinicSettings = {
    ...db.clinicSettings,
    ...next,
    social: { ...db.clinicSettings.social, ...(next.social || {}) },
    workingHours: {
      ...db.clinicSettings.workingHours,
      ...(next.workingHours || {}),
    },
  };
  saveDb(db);
  return db.clinicSettings;
}

export function getAllBranches(): DbBranch[] {
  return ensureDb().branches;
}

export function getBranchById(id: string): DbBranch | undefined {
  return ensureDb().branches.find((b) => b.id === id);
}

export function createBranch(data: Omit<DbBranch, "id" | "createdAt">): DbBranch {
  const db = ensureDb();
  const branch: DbBranch = {
    ...data,
    id: `branch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.branches.push(branch);
  saveDb(db);
  return branch;
}

export function updateBranch(
  id: string,
  updates: Partial<Omit<DbBranch, "id" | "createdAt">>
): DbBranch | null {
  const db = ensureDb();
  const idx = db.branches.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  db.branches[idx] = {
    ...db.branches[idx],
    ...updates,
    workingHours: {
      ...db.branches[idx].workingHours,
      ...(updates.workingHours || {}),
    },
  };
  saveDb(db);
  return db.branches[idx];
}

export function deleteBranch(id: string): boolean {
  const db = ensureDb();
  const before = db.branches.length;
  db.branches = db.branches.filter((b) => b.id !== id);
  if (db.branches.length === before) return false;
  saveDb(db);
  return true;
}

export function getAllServices(): DbService[] {
  return ensureDb().services;
}

export function createService(data: Omit<DbService, "id" | "createdAt">): DbService {
  const db = ensureDb();
  const service: DbService = {
    ...data,
    id: `svc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.services.push(service);
  saveDb(db);
  return service;
}

export function updateService(
  id: string,
  updates: Partial<Omit<DbService, "id" | "createdAt">>
): DbService | null {
  const db = ensureDb();
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.services[idx] = { ...db.services[idx], ...updates };
  saveDb(db);
  return db.services[idx];
}

export function deleteService(id: string): boolean {
  const db = ensureDb();
  const before = db.services.length;
  db.services = db.services.filter((s) => s.id !== id);
  if (db.services.length === before) return false;
  saveDb(db);
  return true;
}

export function getAllCustomerSources(): DbCustomerSource[] {
  return ensureDb().customerSources;
}

export function createCustomerSource(
  data: Omit<DbCustomerSource, "id" | "createdAt" | "type">
): DbCustomerSource {
  const db = ensureDb();
  const source: DbCustomerSource = {
    ...data,
    type: "custom",
    id: `src-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.customerSources.push(source);
  saveDb(db);
  return source;
}

export function updateCustomerSource(
  id: string,
  updates: Partial<Omit<DbCustomerSource, "id" | "createdAt" | "type">>
): DbCustomerSource | null {
  const db = ensureDb();
  const idx = db.customerSources.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  if (db.customerSources[idx].type === "system") return null;
  db.customerSources[idx] = { ...db.customerSources[idx], ...updates };
  saveDb(db);
  return db.customerSources[idx];
}

export function deleteCustomerSource(id: string): boolean {
  const db = ensureDb();
  const source = db.customerSources.find((s) => s.id === id);
  if (!source || source.type === "system") return false;
  db.customerSources = db.customerSources.filter((s) => s.id !== id);
  saveDb(db);
  return true;
}

// ─── Store ───

export function getAllStoreProducts(): StoreProduct[] {
  return ensureDb().storeProducts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getStoreProductById(id: string): StoreProduct | undefined {
  return ensureDb().storeProducts.find((p) => p.id === id);
}

export function createStoreProduct(data: Omit<StoreProduct, "id" | "createdAt">): StoreProduct {
  const db = ensureDb();
  const product: StoreProduct = {
    ...data,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.storeProducts.unshift(product);
  saveDb(db);
  return product;
}

export function updateStoreProduct(
  id: string,
  updates: Partial<Omit<StoreProduct, "id" | "createdAt">>
): StoreProduct | null {
  const db = ensureDb();
  const idx = db.storeProducts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.storeProducts[idx] = { ...db.storeProducts[idx], ...updates };
  saveDb(db);
  return db.storeProducts[idx];
}

export function deleteStoreProduct(id: string): boolean {
  const db = ensureDb();
  const before = db.storeProducts.length;
  db.storeProducts = db.storeProducts.filter((p) => p.id !== id);
  if (db.storeProducts.length === before) return false;
  saveDb(db);
  return true;
}

export function getStorePayments(): StorePayment[] {
  return ensureDb().storePayments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getStoreOrders(): StoreOrder[] {
  return ensureDb().storeOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getStoreStats() {
  const db = ensureDb();
  const products = db.storeProducts;
  const payments = db.storePayments.filter((p) => p.status === "paid");
  const totalSales = payments.reduce((s, p) => s + p.amount, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  return {
    productsCount: products.length,
    ordersCount: db.storeOrders.length,
    totalSales,
    lowStock,
    pendingPayments: db.storePayments.filter((p) => p.status === "pending").length,
  };
}

export function getClinicOverview() {
  const db = ensureDb();
  const staffCount = db.users.length;
  const completedSections = [
    Boolean(db.clinicSettings?.name),
    db.branches.length > 0,
    staffCount > 0,
    db.services.length > 0,
    db.doctors.length > 0,
    db.customerSources.length > 0,
    false,
    true,
    true,
    false,
    false,
  ];
  const totalSections = 11;
  const completed = completedSections.filter(Boolean).length;
  return {
    settings: db.clinicSettings,
    counts: {
      branches: db.branches.length,
      staff: staffCount,
      services: db.services.length,
      doctors: db.doctors.length,
      sources: db.customerSources.length,
      staffRules: 0,
      websitePages: 2,
      mediaFiles: 1,
    },
    progress: {
      completed,
      total: totalSections,
      percent: Math.round((completed / totalSections) * 100),
    },
  };
}

export function getBranchNames(): string[] {
  return getAllBranches().map((b) => b.name);
}

export function getServiceNames(): string[] {
  return getAllServices().map((s) => s.name);
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  if (days < 30) return `منذ ${days} يوم`;
  const months = Math.floor(days / 30);
  if (months === 1) return "منذ شهر";
  return `منذ ${months} شهر`;
}

export function formatDateTimeAr(iso: string): string {
  return formatFollowUpDateAr(iso);
}

export function formatFollowUpGap(fromIso: string, toIso: string): string {
  if (!toIso) return "";
  try {
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    if (isNaN(to)) return "";
    const days = Math.round((to - from) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "اليوم";
    if (days === 1) return "+ يوم";
    if (days < 7) return `+ ${days} أيام`;
    if (days < 30) return `+ ${Math.round(days / 7)} أسابيع`;
    return `+ ${Math.round(days / 30)} شهر`;
  } catch {
    return "";
  }
}

// ─── Campaign tracking ───

function nextCampaignId(campaigns: DbCampaign[]): string {
  const nums = campaigns
    .map((c) => parseInt(c.id, 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 100;
  return String(max + 1);
}

function inDateRange(iso: string, from?: string, to?: string): boolean {
  const t = new Date(iso).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (t > end.getTime()) return false;
  }
  return true;
}

export function getAllCampaigns(): DbCampaign[] {
  return ensureDb().campaigns;
}

export function getCampaignById(id: string): DbCampaign | undefined {
  return ensureDb().campaigns.find((c) => c.id === id);
}

export function createCampaign(data: {
  doctorId: string;
  platform: DbCampaign["platform"];
  campaignName: string;
  campaignCode?: string;
}): DbCampaign {
  const db = ensureDb();
  const id = nextCampaignId(db.campaigns);
  const baseCode = data.campaignCode?.trim() || slugifyCampaignCode(data.campaignName);
  const campaign: DbCampaign = {
    id,
    doctorId: data.doctorId,
    platform: data.platform,
    campaignName: data.campaignName.trim(),
    campaignCode: baseCode || `campaign-${id}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db.campaigns.push(campaign);
  saveDb(db);
  return campaign;
}

export function updateCampaign(
  id: string,
  updates: Partial<Omit<DbCampaign, "id" | "createdAt">>
): DbCampaign | null {
  const db = ensureDb();
  const idx = db.campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.campaigns[idx] = {
    ...db.campaigns[idx],
    ...updates,
    campaignName: updates.campaignName?.trim() || db.campaigns[idx].campaignName,
    campaignCode:
      updates.campaignCode?.trim() || db.campaigns[idx].campaignCode,
  };
  saveDb(db);
  return db.campaigns[idx];
}

export function deleteCampaign(id: string): boolean {
  const db = ensureDb();
  const before = db.campaigns.length;
  db.campaigns = db.campaigns.filter((c) => c.id !== id);
  if (db.campaigns.length === before) return false;
  saveDb(db);
  return true;
}

export function recordCampaignVisit(
  campaignId: string,
  meta: { ipAddress: string; userAgent: string }
): CampaignVisit | null {
  const db = ensureDb();
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!campaign || campaign.status !== "active") return null;

  const visit: CampaignVisit = {
    id: `visit-${Date.now()}`,
    campaignId: campaign.id,
    doctorId: campaign.doctorId,
    platform: campaign.platform,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    createdAt: new Date().toISOString(),
  };
  db.campaignVisits.push(visit);
  saveDb(db);
  return visit;
}

export function getCampaignVisits(filters: CampaignStatsFilters = {}): CampaignVisit[] {
  const db = ensureDb();
  return db.campaignVisits.filter((v) => {
    if (filters.campaignId && v.campaignId !== filters.campaignId) return false;
    if (filters.doctorId && v.doctorId !== filters.doctorId) return false;
    if (filters.platform && v.platform !== filters.platform) return false;
    if (!inDateRange(v.createdAt, filters.dateFrom, filters.dateTo)) return false;
    return true;
  });
}

/** Leads = form submissions; bookings = booked or attended status */
export function getCampaignStats(filters: CampaignStatsFilters = {}): CampaignStats {
  const db = ensureDb();
  const visits = getCampaignVisits(filters);

  const leads = db.inquiries.filter((inq) => {
    const cid = inq.tracking?.campaignId;
    if (!cid) return false;
    if (filters.campaignId && cid !== filters.campaignId) return false;
    if (filters.doctorId && inq.tracking?.doctorId !== filters.doctorId) return false;
    if (filters.platform && inq.tracking?.platform !== filters.platform) return false;
    if (!inDateRange(inq.createdAt, filters.dateFrom, filters.dateTo)) return false;
    return true;
  });

  const bookings = leads.filter(
    (inq) => inq.status === "booked" || inq.status === "attended"
  );

  const totalVisits = visits.length;
  const totalLeads = leads.length;
  const totalBookings = bookings.length;
  const conversionRate =
    totalVisits > 0 ? Math.round((totalLeads / totalVisits) * 1000) / 10 : 0;

  return { totalVisits, totalLeads, totalBookings, conversionRate };
}

export function getCampaignStatsByCampaign(
  filters: CampaignStatsFilters = {}
): Array<
  DbCampaign & CampaignStats & { doctorName: string; url: string }
> {
  const db = ensureDb();
  const doctorMap = new Map(db.doctors.map((d) => [d.id, d.name]));

  return db.campaigns.map((campaign) => {
    const scoped = getCampaignStats({ ...filters, campaignId: campaign.id });
    return {
      ...campaign,
      ...scoped,
      doctorName: doctorMap.get(campaign.doctorId) || "—",
      url: `/c/${campaign.id}`,
    };
  });
}

