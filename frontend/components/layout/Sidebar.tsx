'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Flag, 
  User, 
  LogOut,
  FileText,
  Settings
} from 'lucide-react';
import { getUser, removeToken } from '@/lib/auth';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CITIZEN', 'CLERK', 'SECTION_OFFICER', 'HOD', 'AUDITOR'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { path: '/roles', label: 'Roles', icon: Shield, roles: ['ADMIN'] },
  { path: '/feature-flags', label: 'Feature Flags', icon: Flag, roles: ['ADMIN'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'AUDITOR'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['ADMIN', 'CITIZEN', 'CLERK', 'SECTION_OFFICER', 'HOD', 'AUDITOR'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">HDAS</h1>
        <p className="text-xs text-white/60 mt-1">Human Delay Accountability</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`sidebar-item w-full ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="mb-3 px-4 py-2 bg-white/10 rounded-xl">
          <p className="text-sm font-medium">{user?.username}</p>
          <p className="text-xs text-white/60">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-300 hover:bg-red-500/20"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
