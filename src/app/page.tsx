import { getClinicSettings } from "@/lib/db";
import { LandingPage } from "@/components/landing/LandingPage";

export async function generateMetadata() {
  const s = getClinicSettings();
  return {
    title: `${s.name}${s.tagline ? ` | ${s.tagline}` : ""}`,
    description: s.description || `احجز موعدك في ${s.name}`,
  };
}

export default function Home() {
  return <LandingPage />;
}
