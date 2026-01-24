'use client'

import { useRouter } from 'next/navigation'

export default function ForbiddenPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="surface-card-elevated p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">403 Forbidden</h1>
            <p className="text-body text-slate-600">
              You don't have permission to access this page.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push('/unauthorized')}
              className="btn-secondary w-full"
            >
              View Unauthorized Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
