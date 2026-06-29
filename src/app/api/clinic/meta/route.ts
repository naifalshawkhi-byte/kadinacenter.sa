import { NextResponse } from "next/server";
import { getBranchNames, getServiceNames } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    branches: getBranchNames(),
    services: getServiceNames(),
  });
}
