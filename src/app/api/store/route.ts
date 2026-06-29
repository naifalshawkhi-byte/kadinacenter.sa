import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getAllStoreProducts,
  getStoreOrders,
  getStorePayments,
  getStoreStats,
} from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  return NextResponse.json({
    stats: getStoreStats(),
    payments: getStorePayments(),
    orders: getStoreOrders(),
    products: getAllStoreProducts(),
  });
}
