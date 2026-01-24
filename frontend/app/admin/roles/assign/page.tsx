'use client'

import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminAssignRole() {
  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Assign Role"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Assign Role</h1>
        <p className="text-slate-600">Modify user roles and permissions.</p>
        <div className="surface-card-elevated p-8">
          <p className="text-slate-500">Coming Soon: Role assignment interface</p>
        </div>
      </div>
    </AdminLayout>
  )
}
