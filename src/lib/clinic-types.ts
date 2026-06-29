export type EntityStatus = "active" | "inactive";

export interface ClinicSettings {
  name: string;
  tagline: string;
  slug: string;
  description: string;
  logo: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  address: string;
  workingHours: Record<string, string>;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    snapchat: string;
  };
}

export interface DbBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: Record<string, string>;
  status: EntityStatus;
  createdAt: string;
}

export interface DbService {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  branch: string;
  status: EntityStatus;
  createdAt: string;
}

export interface DbCustomerSource {
  id: string;
  name: string;
  description: string;
  type: "system" | "custom";
  status: EntityStatus;
  createdAt: string;
}

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DAY_LABELS: Record<(typeof DAY_KEYS)[number], string> = {
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
  sunday: "الأحد",
};

export const DEFAULT_WORKING_HOURS: Record<string, string> = {
  monday: "8:00 AM - 8:00 PM",
  tuesday: "8:00 AM - 8:00 PM",
  wednesday: "8:00 AM - 8:00 PM",
  thursday: "8:00 AM - 8:00 PM",
  friday: "8:00 AM - 8:00 PM",
  saturday: "9:00 AM - 6:00 PM",
  sunday: "9:00 AM - 6:00 PM",
};

export function defaultClinicSettings(): ClinicSettings {
  return {
    name: "راء كير ديمو",
    tagline: "للتسويق الصحي",
    slug: "raa-demo",
    description:
      "عيادة متكاملة للأسنان والجلدية والتغذية العلاجية. نقدم خدمات تجميلية وعلاجية بأحدث التقنيات مع فريق طبي متخصص.",
    logo: "",
    phone: "+966114555444",
    email: "info@raa-demo.com",
    whatsapp: "",
    website: "https://raa-demo.com",
    address: "الرياض - حي العليا - طريق الملك فهد",
    workingHours: { ...DEFAULT_WORKING_HOURS },
    social: {
      facebook: "https://facebook.com/raademo",
      instagram: "https://instagram.com/raa_demo",
      twitter: "https://twitter.com/raademo",
      linkedin: "https://linkedin.com/company/clinic",
      youtube: "https://youtube.com/@clinic",
      tiktok: "https://tiktok.com/@raademo",
      snapchat: "https://snapchat.com/add/raademo",
    },
  };
}

export function defaultBranches(): DbBranch[] {
  const now = new Date().toISOString();
  const branchHours = {
    monday: "9:00 AM - 10:00 PM",
    tuesday: "9:00 AM - 10:00 PM",
    wednesday: "9:00 AM - 10:00 PM",
    thursday: "9:00 AM - 10:00 PM",
    friday: "4:00 PM - 11:00 PM",
    saturday: "9:00 AM - 10:00 PM",
    sunday: "9:00 AM - 10:00 PM",
  };
  return [
    {
      id: "branch-1",
      name: "جدة - الروضة",
      address: "شارع الأمير سلطان، حي الروضة، جدة",
      phone: "+966122000222",
      email: "jeddah@raa-demo.com",
      workingHours: branchHours,
      status: "active",
      createdAt: now,
    },
    {
      id: "branch-2",
      name: "الرياض - العليا",
      address: "طريق الملك فهد، حي العليا، الرياض",
      phone: "+966112000100",
      email: "riyadh@raa-demo.com",
      workingHours: branchHours,
      status: "active",
      createdAt: now,
    },
    {
      id: "branch-3",
      name: "الدمام - الشاطئ",
      address: "كورنيش الدمام، حي الشاطئ، الدمام",
      phone: "+966133000333",
      email: "dammam@raa-demo.com",
      workingHours: branchHours,
      status: "active",
      createdAt: now,
    },
  ];
}

export function defaultServices(): DbService[] {
  const now = new Date().toISOString();
  return [
    { id: "svc-1", name: "ابتسامة هوليود (فينير)", description: "تحويل كامل للابتسامة بتقنية الفينير", duration: 90, price: 8500, branch: "", status: "active", createdAt: now },
    { id: "svc-2", name: "استشارة تغذية شاملة", description: "تقييم غذائي وخطة علاجية مخصصة", duration: 60, price: 500, branch: "", status: "active", createdAt: now },
    { id: "svc-3", name: "استشارة جلدية", description: "فحص وتشخيص الحالات الجلدية", duration: 30, price: 350, branch: "", status: "active", createdAt: now },
    { id: "svc-4", name: "تنظيف الأسنان وتلميعها", description: "تنظيف احترافي وتلميع", duration: 45, price: 400, branch: "", status: "active", createdAt: now },
    { id: "svc-5", name: "جلسة هيدرافيشل", description: "تنظيف وتغذية البشرة العميق", duration: 60, price: 450, branch: "", status: "active", createdAt: now },
    { id: "svc-6", name: "حقن بوتوكس", description: "علاج التجاعيد والخطوط التعبيرية", duration: 45, price: 1200, branch: "", status: "active", createdAt: now },
    { id: "svc-7", name: "حقن فيلر", description: "تعبئة وتجميل المناطق المختلفة", duration: 45, price: 1500, branch: "", status: "active", createdAt: now },
    { id: "svc-8", name: "ليزر إزالة شعر", description: "جلسة ليزر لإزالة الشعر", duration: 30, price: 350, branch: "", status: "active", createdAt: now },
  ];
}

export function defaultCustomerSources(): DbCustomerSource[] {
  const now = new Date().toISOString();
  const system = (name: string, description: string): DbCustomerSource => ({
    id: `src-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    description,
    type: "system",
    status: "active",
    createdAt: now,
  });
  return [
    system("Google Ads", "جوجل"),
    system("Instagram Ads", "إعلانات إنستقرام"),
    system("Manual", ""),
    system("Other", ""),
    system("Phone", ""),
    system("Referral", "إحالة"),
    system("Snapchat Ads", "سناب شات"),
    system("Social Media", ""),
    system("TikTok Ads", "تيك توك"),
    system("Walk-in", "زيارة"),
    system("Website", ""),
    system("WhatsApp", ""),
  ];
}

export function defaultDoctorsSeed() {
  return [
    { name: "د. أحمد الزهراني", specialty: "الأمراض الجلدية والليزر", branch: "جدة - الروضة" },
    { name: "د. ريم القحطاني", specialty: "تجميل وعناية بالبشرة", branch: "الرياض - العليا" },
    { name: "د. محمد العتibi", specialty: "طب الأسنان التجميلي", branch: "الرياض - العليا" },
    { name: "د. سارة الدوسري", specialty: "التغذية العلاجية", branch: "جدة - الروضة" },
    { name: "د. خالد الشمري", specialty: "جراحة التجميل", branch: "الدمام - الشاطئ" },
  ];
}

export type ClinicSectionId =
  | "settings"
  | "branches"
  | "staff"
  | "services"
  | "doctors"
  | "sources"
  | "staff-distribution"
  | "website"
  | "menus"
  | "media"
  | "seo"
  | "legal"
  | "domain";
