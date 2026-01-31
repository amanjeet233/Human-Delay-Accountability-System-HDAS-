'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { isAuthenticated, hasRole } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-heading">System Settings</h1>
              <p className="text-subtext mt-1">Configure system preferences</p>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-heading">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-heading">Email Notifications</p>
                      <p className="text-sm text-subtext">Receive alerts via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-heading">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-heading">Two-Factor Authentication</p>
                      <p className="text-sm text-subtext">Add an extra layer of security</p>
                    </div>
                    <button className="btn-secondary px-4 py-2">
                      Configure
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-heading">Appearance</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-heading mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="p-4 border-2 border-primary bg-white rounded-xl text-sm font-medium">
                        Light
                      </button>
                      <button className="p-4 border border-gray-200 bg-gray-800 text-white rounded-xl text-sm font-medium">
                        Dark
                      </button>
                      <button className="p-4 border border-gray-200 bg-white rounded-xl text-sm font-medium">
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
