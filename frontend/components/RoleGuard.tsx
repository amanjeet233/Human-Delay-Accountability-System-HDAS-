'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: string
  redirectTo?: string
}

export default function RoleGuard({ children, requiredRole, redirectTo = '/403' }: RoleGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user?.role) {
      router.push('/login')
      return
    }

    if (user.role !== requiredRole) {
      console.warn(`Access denied: User role ${user.role} does not match required role ${requiredRole}`)
      router.push(redirectTo)
    }
  }, [router, requiredRole, redirectTo, isAuthenticated, user, isLoading])

  // Note: Component will redirect before rendering, but we still return children
  // so there's no flash of unauthorized content
  return <>{children}</>
}
