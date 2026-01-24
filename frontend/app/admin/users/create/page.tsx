'use client'

import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminCreateUser() {
  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Create User"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
        <p className="text-slate-600">Add a new system user.</p>
        <div className="surface-card-elevated p-8">
          <p className="text-slate-500">Coming Soon: Create user interface</p>
        </div>
      </div>
    </AdminLayout>
  )
}
