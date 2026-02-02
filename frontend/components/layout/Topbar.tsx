'use client';

import { Bell, Search } from 'lucide-react';
import { useUser } from '@/lib/userContext';

export default function Topbar() {
  const { user } = useUser();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-heading">{user?.username}</p>
            <p className="text-xs text-subtext">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
