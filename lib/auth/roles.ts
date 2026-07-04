import type { Role } from "@prisma/client";

export function isAdmin(role: Role | undefined): boolean {
  return role === "ADMIN";
}

export function isLawyer(role: Role | undefined): boolean {
  return role === "LAWYER";
}

export function isClient(role: Role | undefined): boolean {
  return role === "CLIENT";
}

/** Professional contract review — lawyers only (not admin, not client). */
export function canGenerateContractReview(role: Role | undefined): boolean {
  return role === "LAWYER";
}

export function canViewContractReview(role: Role | undefined): boolean {
  return role === "CLIENT" || role === "LAWYER";
}
