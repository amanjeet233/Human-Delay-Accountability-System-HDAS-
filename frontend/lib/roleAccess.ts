export enum SystemRole {
  CITIZEN = 'CITIZEN',
  CLERK = 'CLERK',
  SECTION_OFFICER = 'SECTION_OFFICER',
  HOD = 'HOD',
  ADMIN = 'ADMIN',
  AUDITOR = 'AUDITOR'
}

export enum Permission {
  // Citizen Permissions
  CREATE_REQUEST = 'CREATE_REQUEST',
  UPLOAD_DOCUMENTS = 'UPLOAD_DOCUMENTS',
  VIEW_OWN_REQUESTS = 'VIEW_OWN_REQUESTS',
  
  // Clerk Permissions
  VIEW_ASSIGNED_REQUESTS = 'VIEW_ASSIGNED_REQUESTS',
  VERIFY_REQUEST = 'VERIFY_REQUEST',
  FORWARD_REQUEST = 'FORWARD_REQUEST',
  ADD_DELAY_REASON = 'ADD_DELAY_REASON',
  
  // Section Officer Permissions
  APPROVE_REQUEST = 'APPROVE_REQUEST',
  REJECT_REQUEST = 'REJECT_REQUEST',
  VIEW_ESCALATION_ALERTS = 'VIEW_ESCALATION_ALERTS',
  
  // HOD Permissions
  FINAL_APPROVE = 'FINAL_APPROVE',
  FINAL_REJECT = 'FINAL_REJECT',
  HANDLE_ESCALATIONS = 'HANDLE_ESCALATIONS',
  VIEW_DEPARTMENT_SUMMARY = 'VIEW_DEPARTMENT_SUMMARY',
  
  // Admin Permissions
  CREATE_USERS = 'CREATE_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  CONFIGURE_PROCESSES = 'CONFIGURE_PROCESSES',
  MANAGE_FEATURE_FLAGS = 'MANAGE_FEATURE_FLAGS',
  VIEW_ALL_DATA = 'VIEW_ALL_DATA',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  
  // Auditor Permissions
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  VIEW_DELAY_REPORTS = 'VIEW_DELAY_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA'
}

// Role-Permission Mapping
const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SystemRole.CITIZEN]: [
    Permission.CREATE_REQUEST,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_OWN_REQUESTS
  ],
  
  [SystemRole.CLERK]: [
    Permission.VIEW_ASSIGNED_REQUESTS,
    Permission.VERIFY_REQUEST,
    Permission.FORWARD_REQUEST,
    Permission.ADD_DELAY_REASON
  ],
  
  [SystemRole.SECTION_OFFICER]: [
    Permission.VIEW_ASSIGNED_REQUESTS,
    Permission.VERIFY_REQUEST,
    Permission.FORWARD_REQUEST,
    Permission.APPROVE_REQUEST,
    Permission.REJECT_REQUEST,
    Permission.VIEW_ESCALATION_ALERTS
  ],
  
  [SystemRole.HOD]: [
    Permission.VIEW_ASSIGNED_REQUESTS,
    Permission.FINAL_APPROVE,
    Permission.FINAL_REJECT,
    Permission.HANDLE_ESCALATIONS,
    Permission.VIEW_DEPARTMENT_SUMMARY
  ],
  
  [SystemRole.ADMIN]: [
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
    Permission.ASSIGN_ROLES,
    Permission.CONFIGURE_PROCESSES,
    Permission.MANAGE_FEATURE_FLAGS,
    Permission.VIEW_ALL_DATA,
    Permission.VIEW_ANALYTICS
  ],
  
  [SystemRole.AUDITOR]: [
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_DELAY_REPORTS,
    Permission.EXPORT_DATA
  ]
};

// Role Dashboard Routes
const ROLE_DASHBOARDS: Record<SystemRole, string> = {
  [SystemRole.CITIZEN]: '/citizen/dashboard',
  [SystemRole.CLERK]: '/clerk/dashboard',
  [SystemRole.SECTION_OFFICER]: '/so/dashboard',
  [SystemRole.HOD]: '/hod/dashboard',
  [SystemRole.ADMIN]: '/admin/dashboard',
  [SystemRole.AUDITOR]: '/auditor/dashboard'
};

// Role Navigation Items
const ROLE_NAVIGATION: Record<SystemRole, Array<{label: string; href: string}>> = {
  [SystemRole.CITIZEN]: [
    { label: 'Dashboard', href: '/citizen/dashboard' },
    { label: 'New Request', href: '/citizen/requests/new' },
    { label: 'My Requests', href: '/citizen/requests/my' },
    { label: 'Timeline', href: '/citizen/timeline' }
  ],
  
  [SystemRole.CLERK]: [
    { label: 'Dashboard', href: '/clerk/dashboard' },
    { label: 'Assigned Requests', href: '/clerk/tasks/assigned' },
    { label: 'Timeline', href: '/clerk/timeline' }
  ],
  
  [SystemRole.SECTION_OFFICER]: [
    { label: 'Dashboard', href: '/so/dashboard' },
    { label: 'Review Requests', href: '/so/review/queue' },
    { label: 'Escalation Alerts', href: '/so/escalations' }
  ],
  
  [SystemRole.HOD]: [
    { label: 'Dashboard', href: '/hod/dashboard' },
    { label: 'Final Approval', href: '/hod/approvals/final' },
    { label: 'Department Overview', href: '/hod/department' }
  ],
  
  [SystemRole.ADMIN]: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'User Management', href: '/admin/users' },
    { label: 'Process Config', href: '/admin/processes' },
    { label: 'Feature Flags', href: '/admin/features' },
    { label: 'Analytics', href: '/admin/analytics' }
  ],
  
  [SystemRole.AUDITOR]: [
    { label: 'Dashboard', href: '/auditor/dashboard' },
    { label: 'Audit Logs', href: '/auditor/logs' },
    { label: 'Delay Reports', href: '/auditor/reports' },
    { label: 'Transparency', href: '/auditor/transparency' }
  ]
};

export class RoleAccessControl {
  private static currentUser: { username: string; email: string; role: SystemRole } | null = null;

  static setCurrentUser(user: { username: string; email: string; role: SystemRole } | null) {
    this.currentUser = user;
  }

  static getCurrentUser(): { username: string; email: string; role: SystemRole } | null {
    return this.currentUser;
  }
  
  static getCurrentRole(): SystemRole | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
  
  static hasPermission(permission: Permission): boolean {
    const role = this.getCurrentRole();
    if (!role) return false;
    
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }
  
  static hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }
  
  static canAccessDashboard(requiredRole: SystemRole): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === requiredRole;
  }
  
  static getDashboardUrl(): string {
    const role = this.getCurrentRole();
    return role ? ROLE_DASHBOARDS[role] : '/login';
  }
  
  static getNavigationItems(): Array<{label: string; href: string}> {
    const role = this.getCurrentRole();
    return role ? ROLE_NAVIGATION[role] || [] : [];
  }
  
  static redirectToDashboard(): void {
    const dashboardUrl = this.getDashboardUrl();
    if (typeof window !== 'undefined') {
      window.location.href = dashboardUrl;
    }
  }
  
  static validateAccess(requiredRole: SystemRole): boolean {
    const currentRole = this.getCurrentRole();
    if (currentRole !== requiredRole) {
      console.warn(`Access denied: Current role ${currentRole} cannot access ${requiredRole} dashboard`);
      return false;
    }
    return true;
  }
  
  static getRolePermissions(): Permission[] {
    const role = this.getCurrentRole();
    return role ? ROLE_PERMISSIONS[role] || [] : [];
  }
  
  static isReadOnly(): boolean {
    const role = this.getCurrentRole();
    return role === SystemRole.AUDITOR;
  }
}
