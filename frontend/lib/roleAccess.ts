export type Role = 'ADMIN' | 'HOD' | 'SECTION_OFFICER' | 'CLERK' | 'CITIZEN';

// Redirect all roles to the unified dashboard route to avoid 404s
// Role-specific views are handled inside /dashboard based on backend role
export const roleDashboard: Record<Role, string> = {
  ADMIN: '/dashboard',
  HOD: '/dashboard',
  SECTION_OFFICER: '/dashboard',
  CLERK: '/dashboard',
  CITIZEN: '/dashboard',
};

export const roleAllowedPrefixes: Record<Role, string[]> = {
  ADMIN: ['/', '/admin', '/hod', '/section-officer', '/clerk', '/citizen'],
  HOD: ['/hod'],
  SECTION_OFFICER: ['/section-officer'],
  CLERK: ['/clerk'],
  CITIZEN: ['/citizen'],
};

export function getDashboardPath(role: string | undefined | null): string {
  if (!role) return '/login';
  const key = role.toUpperCase() as Role;
  return roleDashboard[key] ?? '/login';
}

export function isPathAllowed(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false;
  const key = role.toUpperCase() as Role;
  if (key === 'ADMIN') return true;
  const prefixes = roleAllowedPrefixes[key] || [];
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
