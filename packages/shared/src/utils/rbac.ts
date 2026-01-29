import type { Role } from '../types';

const ROLE_ORDER: Role[] = ['viewer', 'analyst', 'partner', 'admin'];

export function hasRole(required: Role, actual: Role | null | undefined): boolean {
  if (!actual) return false;
  return ROLE_ORDER.indexOf(actual) >= ROLE_ORDER.indexOf(required);
}

export function isAdmin(role: Role | null | undefined): boolean {
  return role === 'admin';
}
