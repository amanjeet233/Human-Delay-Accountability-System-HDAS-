'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users as UsersIcon, Plus, Edit, Trash2, Shield, Search, KeyRound } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { isAuthenticated, hasRole } from '@/lib/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  firstName?: string;
  lastName?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<{username: string; email: string; role: string; active: boolean}>({ username: '', email: '', role: 'CITIZEN', active: true });
  const [editForm, setEditForm] = useState<{email: string; firstName?: string; lastName?: string; active: boolean}>({ email: '', firstName: '', lastName: '', active: true });
  const [assignRole, setAssignRole] = useState<string>('CITIZEN');
  const roles = ['ADMIN','SECTION_OFFICER','CLERK','HOD','AUDITOR','CITIZEN'];
  const [newPassword, setNewPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() || !hasRole('ADMIN')) {
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <>
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-heading">User Management</h1>
                <p className="text-subtext mt-1">Manage system users and permissions</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add User
              </button>
            </div>

            <div className="glass-card p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-subtext">Loading users...</p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-subtext uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-subtext uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-subtext uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-subtext uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-subtext uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                                {user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-heading">{user.username}</div>
                                <div className="text-sm text-subtext">{user.firstName} {user.lastName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-subtext">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="badge badge-info flex items-center gap-1 w-fit">
                              <Shield size={12} />
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${user.active ? 'badge-success' : 'badge-error'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setSelectedUser(user); setEditForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, active: user.active }); setShowEditModal(true); }}>
                                <Edit size={16} className="text-gray-600" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setSelectedUser(user); setAssignRole(user.role); setShowAssignRoleModal(true); }}>
                                <Shield size={16} className="text-primary" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setSelectedUser(user); setNewPassword(''); setShowResetPasswordModal(true); }}>
                                <KeyRound size={16} className="text-gray-600" />
                              </button>
                              <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" onClick={async () => { setSubmitting(true); try { await api.delete(`/admin/users/${user.id}`); await loadUsers(); } finally { setSubmitting(false); } }}>
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <UsersIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-subtext">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    {/* Create User Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-heading mb-4">Create User</h3>
          <div className="space-y-3">
            <input className="input w-full" placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
            <input className="input w-full" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <select className="input w-full" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
              {roles.map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={createForm.active} onChange={(e) => setCreateForm({ ...createForm, active: e.target.checked })} />
              <span className="text-sm text-subtext">Active</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={submitting} onClick={async () => { setSubmitting(true); try { await api.createUser(createForm); setShowCreateModal(false); await loadUsers(); } finally { setSubmitting(false); } }}>Create</button>
          </div>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {showEditModal && selectedUser && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-heading mb-4">Edit User</h3>
          <div className="space-y-3">
            <input className="input w-full" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input className="input w-full" placeholder="First Name" value={editForm.firstName || ''} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
            <input className="input w-full" placeholder="Last Name" value={editForm.lastName || ''} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} />
              <span className="text-sm text-subtext">Active</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={submitting} onClick={async () => { setSubmitting(true); try { await api.updateUser(selectedUser.id, editForm); setShowEditModal(false); await loadUsers(); } finally { setSubmitting(false); } }}>Save</button>
          </div>
        </div>
      </div>
    )}

    {/* Assign Role Modal */}
    {showAssignRoleModal && selectedUser && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-heading mb-4">Assign Role</h3>
          <select className="input w-full" value={assignRole} onChange={(e) => setAssignRole(e.target.value)}>
            {roles.map(r => (<option key={r} value={r}>{r}</option>))}
          </select>
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn-secondary" onClick={() => setShowAssignRoleModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={submitting} onClick={async () => { setSubmitting(true); try { await api.assignRole(selectedUser.id, assignRole); setShowAssignRoleModal(false); await loadUsers(); } finally { setSubmitting(false); } }}>Assign</button>
          </div>
        </div>
      </div>
    )}

    {/* Reset Password Modal */}
    {showResetPasswordModal && selectedUser && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-heading mb-4">Reset Password</h3>
          <input className="input w-full" placeholder="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <div className="flex justify-end gap-2 mt-6">
            <button className="btn-secondary" onClick={() => setShowResetPasswordModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={submitting || !newPassword} onClick={async () => { setSubmitting(true); try { await api.resetPassword(selectedUser.id, newPassword); setShowResetPasswordModal(false); await loadUsers(); } finally { setSubmitting(false); } }}>Reset</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
