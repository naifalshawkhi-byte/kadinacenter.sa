export type StoreProductType = "service" | "package";

export interface CustomizationValue {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  isDefault: boolean;
}

export interface ProductCustomization {
  id: string;
  nameAr: string;
  nameEn: string;
  type: "single" | "multiple";
  required: boolean;
  values: CustomizationValue[];
}

export interface StoreProduct {
  id: string;
  type: StoreProductType;
  nameAr: string;
  nameEn: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice: number;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  requiresAppointment: boolean;
  allowReviews: boolean;
  linkedServiceIds: string[];
  linkedDoctorIds: string[];
  customizations: ProductCustomization[];
  status: "active" | "draft" | "inactive";
  stock: number;
  createdAt: string;
}

export interface StorePayment {
  id: string;
  orderId: string;
  clientName: string;
  amount: number;
  method: "card" | "cash" | "transfer" | "apple_pay";
  status: "paid" | "pending" | "refunded";
  createdAt: string;
}

export interface StoreOrder {
  id: string;
  clientName: string;
  items: number;
  total: number;
  status: "completed" | "pending" | "cancelled";
  createdAt: string;
}

export function defaultStoreProducts(): StoreProduct[] {
  const now = new Date().toISOString();
  return [
    {
      id: "prod-1",
      type: "service",
      nameAr: "جلسة هيدرافيشل",
      nameEn: "Hydrafacial Session",
      slug: "hydrafacial",
      category: "عناية بالبشرة",
      price: 450,
      compareAtPrice: 550,
      descriptionAr: "تنظيف وتغذية البشرة العميق",
      descriptionEn: "Deep skin cleansing and nourishment",
      image: "",
      requiresAppointment: true,
      allowReviews: true,
      linkedServiceIds: ["svc-5"],
      linkedDoctorIds: [],
      customizations: [],
      status: "active",
      stock: 999,
      createdAt: now,
    },
    {
      id: "prod-2",
      type: "package",
      nameAr: "باقة العناية الشاملة",
      nameEn: "Complete Care Package",
      slug: "complete-care",
      category: "باقات",
      price: 2500,
      compareAtPrice: 3200,
      descriptionAr: "باقة متكاملة للعناية بالبشرة",
      descriptionEn: "Complete skincare package",
      image: "",
      requiresAppointment: true,
      allowReviews: true,
      linkedServiceIds: ["svc-3", "svc-5"],
      linkedDoctorIds: [],
      customizations: [],
      status: "active",
      stock: 50,
      createdAt: now,
    },
    {
      id: "prod-3",
      type: "service",
      nameAr: "ابتسامة هوليود (فينير)",
      nameEn: "Hollywood Smile (Veneer)",
      slug: "hollywood-smile",
      category: "أسنان",
      price: 8500,
      compareAtPrice: 9500,
      descriptionAr: "تحويل كامل للابتسامة",
      descriptionEn: "Complete smile transformation",
      image: "",
      requiresAppointment: true,
      allowReviews: false,
      linkedServiceIds: ["svc-1"],
      linkedDoctorIds: [],
      customizations: [],
      status: "active",
      stock: 999,
      createdAt: now,
    },
  ];
}

export function defaultStorePayments(): StorePayment[] {
  const now = new Date();
  return [
    { id: "pay-1", orderId: "ORD-1024", clientName: "أمل الزهراني", amount: 450, method: "card", status: "paid", createdAt: new Date(now.getTime() - 3600000).toISOString() },
    { id: "pay-2", orderId: "ORD-1023", clientName: "سارة العتيبي", amount: 2500, method: "transfer", status: "paid", createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: "pay-3", orderId: "ORD-1022", clientName: "نورة الشمري", amount: 8500, method: "card", status: "pending", createdAt: new Date(now.getTime() - 172800000).toISOString() },
    { id: "pay-4", orderId: "ORD-1021", clientName: "ريم الحربي", amount: 350, method: "cash", status: "paid", createdAt: new Date(now.getTime() - 259200000).toISOString() },
  ];
}

export function defaultStoreOrders(): StoreOrder[] {
  const now = new Date();
  return [
    { id: "ORD-1024", clientName: "أمل الزهراني", items: 1, total: 450, status: "completed", createdAt: new Date(now.getTime() - 3600000).toISOString() },
    { id: "ORD-1023", clientName: "سارة العتيبي", items: 2, total: 2500, status: "completed", createdAt: new Date(now.getTime() - 86400000).toISOString() },
    { id: "ORD-1022", clientName: "نورة الشمري", items: 1, total: 8500, status: "pending", createdAt: new Date(now.getTime() - 172800000).toISOString() },
  ];
}

export const STORE_CATEGORIES = [
  "بدون تصنيف",
  "عناية بالبشرة",
  "تجميل",
  "أسنان",
  "استشارات",
  "باقات",
  "ليزر",
];
