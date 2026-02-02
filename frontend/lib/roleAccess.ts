export type Role = 'ADMIN' | 'HOD' | 'SECTION_OFFICER' | 'CLERK' | 'CITIZEN' | 'AUDITOR';

// Redirect all roles to the unified dashboard route to avoid 404s
// Role-specific views are handled inside /dashboard based on backend role
export const roleDashboard: Record<Role, string> = {
  ADMIN: '/dashboard',
  HOD: '/dashboard',
  SECTION_OFFICER: '/dashboard',
  CLERK: '/dashboard',
  CITIZEN: '/dashboard',
  AUDITOR: '/dashboard',
};

export const roleAllowedPrefixes: Record<Role, string[]> = {
  ADMIN: ['/', '/dashboard', '/admin', '/hod', '/section-officer', '/clerk', '/citizen', '/users', '/roles', '/feature-flags', '/reports', '/profile', '/settings'],
  HOD: ['/dashboard', '/hod', '/profile'],
  SECTION_OFFICER: ['/dashboard', '/section-officer', '/profile'],
  CLERK: ['/dashboard', '/clerk', '/profile'],
  CITIZEN: ['/dashboard', '/citizen', '/profile'],
  AUDITOR: ['/dashboard', '/reports', '/profile'],
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
