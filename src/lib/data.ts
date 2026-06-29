import type {
  Appointment,
  Branch,
  Campaign,
  Client,
  Conversation,
  Doctor,
  Inquiry,
  Product,
  Service,
} from "./types";

export const inquiries: Inquiry[] = [
  { id: "1", name: "منى القحطاني", phone: "+966501234567", status: "booked", note: "متابعة حجز", service: "جلسة هيدرافيشل", branch: "جدة - الروضة", nextFollowUp: "05 مايو 2026 11:00 ص", createdAt: "منذ 22 يوم", hasWhatsApp: true },
  { id: "2", name: "سارة العتيبي", phone: "+966502345678", status: "attended", note: "زيارة أولى", service: "استشارة جلدية", branch: "الرياض - العليا", nextFollowUp: "10 مايو 2026 02:00 م", createdAt: "منذ 15 يوم", hasWhatsApp: true },
  { id: "3", name: "نورة الشمري", phone: "+966503456789", status: "failed", note: "استفسار سعر", service: "حقن بوتوكس", branch: "الدمام - الشاطئ", nextFollowUp: "—", createdAt: "منذ 30 يوم", hasWhatsApp: false },
  { id: "4", name: "ريم الحربي", phone: "+966504567890", status: "booked", note: "تأكيد موعد", service: "حقن فيلر", branch: "جدة - الروضة", nextFollowUp: "08 مايو 2026 10:00 ص", createdAt: "منذ 8 أيام", hasWhatsApp: true },
  { id: "5", name: "فاطمة الدوسري", phone: "+966505678901", status: "attended", note: "متابعة علاج", service: "ابتسامة هوليوود", branch: "الرياض - العليا", nextFollowUp: "12 مايو 2026 04:00 م", createdAt: "منذ شهر", hasWhatsApp: true },
  { id: "6", name: "هند المطيري", phone: "+966506789012", status: "new", note: "استفسار عام", service: "تنظيف بشرة", branch: "الدمام - الشاطئ", nextFollowUp: "15 مايو 2026 09:00 ص", createdAt: "منذ 3 أيام", hasWhatsApp: true },
  { id: "7", name: "لمى الزهراني", phone: "+966507890123", status: "followup", note: "متابعة حجز", service: "ليزر إزالة شعر", branch: "جدة - الروضة", nextFollowUp: "07 مايو 2026 03:00 م", createdAt: "منذ 12 يوم", hasWhatsApp: true },
  { id: "8", name: "عائشة الغامدي", phone: "+966508901234", status: "booked", note: "حجز عاجل", service: "تقشير كيميائي", branch: "الرياض - العليا", nextFollowUp: "06 مايو 2026 11:30 ص", createdAt: "منذ 5 أيام", hasWhatsApp: false },
  { id: "9", name: "مريم السبيعي", phone: "+966509012345", status: "attended", note: "زيارة دورية", service: "ميزوثيرابي", branch: "الدمام - الشاطئ", nextFollowUp: "20 مايو 2026 01:00 م", createdAt: "منذ 45 يوم", hasWhatsApp: true },
  { id: "10", name: "خديجة القحطاني", phone: "+966510123456", status: "failed", note: "لم يرد", service: "فيلر شفاه", branch: "جدة - الروضة", nextFollowUp: "—", createdAt: "منذ 20 يوم", hasWhatsApp: true },
];

export const appointments: Appointment[] = [
  { id: "1", clientName: "منى القحطاني", phone: "+966501234567", service: "جلسة هيدرافيشل", doctor: "د. أحمد السعيد", branch: "جدة - الروضة", date: "2026-05-05", time: "11:00", status: "confirmed" },
  { id: "2", clientName: "سارة العتيبي", phone: "+966502345678", service: "استشارة جلدية", doctor: "د. فاطمة النجار", branch: "الرياض - العليا", date: "2026-05-10", time: "14:00", status: "confirmed" },
  { id: "3", clientName: "ريم الحربي", phone: "+966504567890", service: "حقن فيلر", doctor: "د. خالد العمري", branch: "جدة - الروضة", date: "2026-05-08", time: "10:00", status: "pending" },
  { id: "4", clientName: "هند المطيري", phone: "+966506789012", service: "تنظيف بشرة", doctor: "د. أحمد السعيد", branch: "الدمام - الشاطئ", date: "2026-05-15", time: "09:00", status: "pending" },
  { id: "5", clientName: "عائشة الغامدي", phone: "+966508901234", service: "تقشير كيميائي", doctor: "د. فاطمة النجار", branch: "الرياض - العليا", date: "2026-05-06", time: "11:30", status: "confirmed" },
];

export const clients: Client[] = [
  { id: "1", name: "منى القحطاني", phone: "+966501234567", email: "mona@email.com", visits: 5, lastVisit: "2026-04-10", source: "واتساب" },
  { id: "2", name: "سارة العتيبي", phone: "+966502345678", visits: 12, lastVisit: "2026-04-28", source: "موقع" },
  { id: "3", name: "نورة الشمري", phone: "+966503456789", visits: 2, lastVisit: "2026-03-15", source: "إعلان" },
  { id: "4", name: "ريم الحربي", phone: "+966504567890", email: "reem@email.com", visits: 8, lastVisit: "2026-04-20", source: "واتساب" },
  { id: "5", name: "فاطمة الدوسري", phone: "+966505678901", visits: 15, lastVisit: "2026-05-01", source: "إحالة" },
];

export const products: Product[] = [
  { id: "1", name: "سيروم فيتامين C", price: 199, category: "عناية بالبشرة", stock: 45 },
  { id: "2", name: "كريم واقي شمس SPF50", price: 149, category: "عناية بالبشرة", stock: 80 },
  { id: "3", name: "مجموعة العناية اليومية", price: 399, category: "باقات", stock: 20 },
  { id: "4", name: "ماسك الطين", price: 89, category: "عناية بالبشرة", stock: 60 },
];

export const conversations: Conversation[] = [
  { id: "1", clientName: "منى القحطاني", phone: "+966501234567", lastMessage: "شكراً، سأحضر الموعد", time: "10:30 ص", unread: 0, status: "open" },
  { id: "2", clientName: "هند المطيري", phone: "+966506789012", lastMessage: "ما سعر جلسة التنظيف؟", time: "09:15 ص", unread: 2, status: "open" },
  { id: "3", clientName: "خديجة القحطاني", phone: "+966510123456", lastMessage: "أريد إلغاء الموعد", time: "أمس", unread: 1, status: "open" },
  { id: "4", clientName: "لمى الزهراني", phone: "+966507890123", lastMessage: "تم تأكيد الحجز", time: "أمس", unread: 0, status: "closed" },
];

export const campaigns: Campaign[] = [
  { id: "1", name: "عرض رمضان - خصم 30%", status: "sent", recipients: 1250, sentAt: "2026-04-01", openRate: 68 },
  { id: "2", name: "تذكير مواعيد الأسبوع", status: "scheduled", recipients: 340 },
  { id: "3", name: "إطلاق خدمة هوليوود سمايل", status: "draft", recipients: 0 },
];

export const doctors: Doctor[] = [
  { id: "1", name: "د. أحمد السعيد", specialty: "جلدية وتجميل", branch: "جدة - الروضة", workingHours: "9:00 - 17:00" },
  { id: "2", name: "د. فاطمة النجار", specialty: "جلدية", branch: "الرياض - العليا", workingHours: "10:00 - 18:00" },
  { id: "3", name: "د. خالد العمري", specialty: "تجميل وتجميل نحفي", branch: "جدة - الروضة", workingHours: "11:00 - 19:00" },
];

export const services: Service[] = [
  { id: "1", name: "جلسة هيدرافيشل", duration: 60, price: 450, category: "عناية بالبشرة" },
  { id: "2", name: "استشارة جلدية", duration: 30, price: 200, category: "استشارات" },
  { id: "3", name: "حقن بوتوكس", duration: 45, price: 1200, category: "تجميل" },
  { id: "4", name: "حقن فيلر", duration: 45, price: 1500, category: "تجميل" },
  { id: "5", name: "ابتسامة هوليوود", duration: 120, price: 8000, category: "أسنان" },
  { id: "6", name: "ليزر إزالة شعر", duration: 30, price: 350, category: "ليزر" },
];

export const branchesList = [
  "الرياض - العليا",
  "جدة - الروضة",
  "الدمام - الشاطئ",
];

export const branches: Branch[] = [
  { id: "1", name: "جدة - الروضة", city: "جدة", address: "حي الروضة، شارع الأمير سلطان" },
  { id: "2", name: "الرياض - العليا", city: "الرياض", address: "حي العليا، طريق الملك فهد" },
  { id: "3", name: "الدمام - الشاطئ", city: "الدمام", address: "كورنيش الدمام، حي الشاطئ" },
];

export const statusLabels: Record<string, string> = {
  new: "جديد",
  followup: "متابعة",
  booked: "محجوز",
  attended: "حضر",
  failed: "فشل",
};

export const servicesList = [
  "جلسة هيدرافيشل",
  "استشارة جلدية",
  "حقن بوتوكس",
  "حقن فيلر",
  "ابتسامة هوليوود",
  "تنظيف بشرة",
  "ليزر إزالة شعر",
  "تقشير كيميائي",
  "ميزوثيرابي",
  "فيلر شفاه",
];
