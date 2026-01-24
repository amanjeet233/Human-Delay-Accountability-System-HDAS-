'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, LogOut, User, ChevronDown } from 'lucide-react';

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getNavItems = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', href: '/admin/dashboard', active: pathname === '/admin/dashboard' },
          { label: 'System', href: '/admin/system', active: pathname.includes('/admin/system') },
          { label: 'Users', href: '/admin/users', active: pathname.includes('/admin/users') },
          { label: 'Roles', href: '/admin/roles', active: pathname.includes('/admin/roles') },
          { label: 'Reports', href: '/admin/reports', active: pathname.includes('/admin/reports') },
        ];
      case 'HOD':
        return [
          { label: 'Dashboard', href: '/hod/dashboard', active: pathname === '/hod/dashboard' },
          { label: 'Escalations', href: '/hod/escalations', active: pathname.includes('/hod/escalations') },
          { label: 'Team', href: '/hod/team', active: pathname.includes('/hod/team') },
          { label: 'Reports', href: '/hod/reports', active: pathname.includes('/hod/reports') },
          { label: 'Settings', href: '/hod/settings', active: pathname.includes('/hod/settings') },
        ];
      case 'SECTION_OFFICER':
        return [
          { label: 'Dashboard', href: '/so/dashboard', active: pathname === '/so/dashboard' },
          { label: 'Team Tasks', href: '/so/team', active: pathname.includes('/so/team') },
          { label: 'Escalations', href: '/so/escalations', active: pathname.includes('/so/escalations') },
          { label: 'Approvals', href: '/so/approvals', active: pathname.includes('/so/approvals') },
          { label: 'Reports', href: '/so/reports', active: pathname.includes('/so/reports') },
        ];
      case 'CLERK':
        return [
          { label: 'Dashboard', href: '/clerk/dashboard', active: pathname === '/clerk/dashboard' },
          { label: 'My Tasks', href: '/clerk/tasks', active: pathname.includes('/clerk/tasks') },
          { label: 'Performance', href: '/clerk/performance', active: pathname.includes('/clerk/performance') },
          { label: 'Help', href: '/clerk/help', active: pathname.includes('/clerk/help') },
        ];
      case 'CITIZEN':
        return [
          { label: 'Dashboard', href: '/citizen/dashboard', active: pathname === '/citizen/dashboard' },
          { label: 'My Requests', href: '/citizen/requests/my', active: pathname.includes('/citizen/requests') },
          { label: 'New Request', href: '/requests/create', active: pathname.includes('/create') },
          { label: 'Help', href: '/citizen/help', active: pathname.includes('/citizen/help') },
        ];
      case 'AUDITOR':
        return [
          { label: 'Dashboard', href: '/auditor/dashboard', active: pathname === '/auditor/dashboard' },
          { label: 'Audit Logs', href: '/auditor/logs', active: pathname.includes('/auditor/logs') },
          { label: 'Compliance', href: '/auditor/compliance', active: pathname.includes('/auditor/compliance') },
          { label: 'Reports', href: '/auditor/reports', active: pathname.includes('/auditor/reports') },
          { label: 'Legal Holds', href: '/auditor/legal-holds', active: pathname.includes('/auditor/legal-holds') },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <Shield className="w-8 h-8 text-slate-700 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">HDAS</h1>
                <p className="text-xs text-slate-500">Human Delay Accountability System</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
