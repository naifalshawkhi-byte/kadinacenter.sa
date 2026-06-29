export type InquiryStatus =
  | "new"
  | "followup"
  | "booked"
  | "attended"
  | "failed";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  status: InquiryStatus;
  note: string;
  service: string;
  branch: string;
  nextFollowUp: string;
  createdAt: string;
  hasWhatsApp?: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  service: string;
  doctor: string;
  branch: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  lastVisit: string;
  source: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface Conversation {
  id: string;
  clientName: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "open" | "closed";
}

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sent";
  recipients: number;
  sentAt?: string;
  openRate?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  workingHours: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
}
