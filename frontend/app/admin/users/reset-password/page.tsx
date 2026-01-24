'use client'

import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminResetPassword() {
  return (
    <AdminLayout
      userId="ADMIN-001"
      userName="District Administrator"
      department="District Collector Office"
      currentPage="Reset Password"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
        <p className="text-slate-600">Reset user passwords and manage authentication.</p>
        <div className="surface-card-elevated p-8">
          <p className="text-slate-500">Coming Soon: Password reset interface</p>
        </div>
      </div>
    </AdminLayout>
  )
}
