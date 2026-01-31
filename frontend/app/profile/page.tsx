'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Edit2, Lock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const currentUser = getUser();
  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
      });
    }
  }, [router, currentUser]);

  const handleSave = async () => {
    try {
      // await api.updateProfile(formData);
      setEditMode(false);
      // Refresh user data
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

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
              <h1 className="text-3xl font-bold text-heading">Profile Settings</h1>
              <p className="text-subtext mt-1">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-heading text-lg">{currentUser?.username}</h3>
                <p className="text-sm text-subtext mt-1">{currentUser?.email}</p>
                <div className="mt-4">
                  <span className="badge badge-info inline-flex items-center gap-1">
                    <Shield size={12} />
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-heading">Personal Information</h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn-secondary flex items-center gap-2 px-4 py-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn-secondary px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary px-4 py-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">
                      <User size={16} className="inline mr-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={currentUser?.username || ''}
                      disabled
                      className="input bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-subtext mt-1">Username cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!editMode}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!editMode}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">
                      <Shield size={16} className="inline mr-2" />
                      Role
                    </label>
                    <input
                      type="text"
                      value={currentUser?.role || ''}
                      disabled
                      className="input bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-subtext mt-1">Role is assigned by administrators</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 mt-6">
              <h3 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                <Lock size={20} />
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-heading">Password</p>
                    <p className="text-sm text-subtext">Last changed 30 days ago</p>
                  </div>
                  <button className="btn-secondary px-4 py-2">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
