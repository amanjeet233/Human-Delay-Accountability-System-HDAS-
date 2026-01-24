'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit, Trash2, Shield, Eye, Key, UserX, UserCheck, Search, Filter, MoreVertical } from 'lucide-react';
import { useAuth, apiClient, SystemRole } from '@/lib';

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  active: boolean;
  role: string; // Single role only
  createdAt: string;
  lastLoginAt?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.ADMIN)) {
      router.replace('/unauthorized');
      return;
    }
    loadUsers();
    loadRoles();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    // Roles are hardcoded in the system; no need to fetch
    setRoles([
      { id: '1', name: 'ADMIN', description: 'System Administrator' },
      { id: '2', name: 'CITIZEN', description: 'Citizen User' },
      { id: '3', name: 'CLERK', description: 'Clerk' },
      { id: '4', name: 'SECTION_OFFICER', description: 'Section Officer' },
      { id: '5', name: 'HOD', description: 'Head of Department' },
      { id: '6', name: 'AUDITOR', description: 'Auditor' }
    ]);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && u.active) ||
                         (filterStatus === 'inactive' && !u.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (userData: any) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await apiClient.post('/admin/users', userData);
      console.log('Create user response:', response.data);
      loadUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleEditUser = async (userData: any) => {
    try {
      console.log('Updating user:', selectedUser?.id, 'with data:', userData);
      const response = await apiClient.put(`/admin/users/${selectedUser?.id}`, userData);
      console.log('Update user response:', response.data);
      loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      console.log('Resetting password for user:', userId);
      const response = await apiClient.put(`/admin/users/${userId}/reset-password`, {});
      console.log('Reset password response:', response.data);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status for user:', userId, 'to:', !currentStatus);
      const response = await apiClient.put(`/admin/users/${userId}/status`, { active: !currentStatus });
      console.log('Toggle status response:', response.data);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to soft delete this user?')) {
      try {
        console.log('Deleting user:', userId);
        const response = await apiClient.delete(`/admin/users/${userId}`);
        console.log('Delete user response:', response.data);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-body text-slate-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <Shield className="w-8 h-8 text-slate-700 mr-3" />
                <h1 className="text-xl font-bold text-slate-900">HDAS Admin Control Center</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <button className="nav-link" onClick={() => router.push('/admin/dashboard')}>Dashboard</button>
                <button className="nav-link-active">User Management</button>
                <button className="nav-link" onClick={() => router.push('/admin/roles')}>Role Configuration</button>
                <button className="nav-link">System Settings</button>
                <button className="nav-link">Audit Logs</button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">User Management</h2>
              <p className="text-slate-600 mt-2">Complete user lifecycle management - create, edit, secure, and audit</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="CLERK">CLERK</option>
              <option value="SECTION_OFFICER">SECTION_OFFICER</option>
              <option value="HOD">HOD</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">User Details</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Department</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Last Login</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span key={u.role} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {u.department || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-700"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="p-1 text-slate-500 hover:text-slate-700"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.active)}
                          className="p-1 text-slate-500 hover:text-slate-700"
                          title={u.active ? 'Deactivate' : 'Activate'}
                        >
                          {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Soft Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No users found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-slate-900">{users.length}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.active).length}</div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => !u.active).length}</div>
            <div className="text-sm text-slate-600">Inactive Users</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
            <div className="text-sm text-slate-600">Available Roles</div>
          </div>
        </div>
      </main>

      {/* Create User Modal - Placeholder for now */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <p className="text-slate-600 mb-4">User creation form would be implemented here with all required fields.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Mock create
                  setShowCreateModal(false);
                  loadUsers();
                }}
                className="btn-primary flex-1"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Placeholder */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.firstName} {selectedUser.lastName}</h3>
            <p className="text-slate-600 mb-4">User edit form would be implemented here.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Mock edit
                  setShowEditModal(false);
                  setSelectedUser(null);
                  loadUsers();
                }}
                className="btn-primary flex-1"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
