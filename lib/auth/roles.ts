import type { Role } from "@prisma/client";

export function isAdmin(role: Role | undefined): boolean {
  return role === "ADMIN";
}

export function isBarrister(role: Role | undefined): boolean {
  return role === "BARRISTER";
}

export function isClient(role: Role | undefined): boolean {
  return role === "CLIENT";
}

/** Professional contract review — barristers only (not admin, not client). */
export function canGenerateContractReview(role: Role | undefined): boolean {
  return role === "BARRISTER";
}

export function canViewContractReview(role: Role | undefined): boolean {
  return role === "CLIENT" || role === "BARRISTER";
}
