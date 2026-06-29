import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { computeAppointmentStats, getAppointmentsForRole } from "@/lib/appointments";
import { getAllDoctors, getBranchNames, getServiceNames } from "@/lib/db";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const appointments = getAppointmentsForRole(session!.role, session!.id);
  const stats = computeAppointmentStats(appointments);
  const doctors = getAllDoctors().map((d) => ({ id: d.id, name: d.name }));

  return NextResponse.json({
    appointments,
    stats,
    filters: {
      branches: getBranchNames(),
      services: getServiceNames(),
      doctors: doctors.map((d) => d.name),
    },
  });
}
