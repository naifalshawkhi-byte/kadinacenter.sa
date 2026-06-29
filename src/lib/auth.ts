import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "./db";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is required in production. Generate one: openssl rand -hex 32"
      );
    }
    return new TextEncoder().encode("raacare-dev-secret-local-only");
  }
  if (secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getAuthSecret();
const COOKIE_NAME = "raacare_session";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  sessionVersion: number;
}

export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as unknown as SessionUser;
    const { userExists, getUserSessionVersion } = await import("./db");
    if (!userExists(session.id)) return null;
    if (getUserSessionVersion(session.id) !== (session.sessionVersion ?? 0)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, getAuthSecret };

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isSecretary(role: UserRole): boolean {
  return role === "secretary";
}

export function canManageAssignments(role: UserRole): boolean {
  return role === "admin";
}

export function canViewAllInquiries(role: UserRole): boolean {
  return role === "admin";
}

export function isAssigneeStaff(role: UserRole): boolean {
  return role === "employee" || role === "secretary";
}

export function hasLimitedDashboard(role: UserRole): boolean {
  return isAssigneeStaff(role);
}

export function canAssignSecretary(role: UserRole): boolean {
  return role === "admin";
}

export function canEditInquiries(_role: UserRole): boolean {
  return true;
}

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
