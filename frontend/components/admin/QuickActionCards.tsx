'use client'

import React from 'react'
import { 
  UserPlus, 
  UserCheck, 
  Key, 
  Settings, 
  Flag,
  Users,
  Shield,
  Clock
} from 'lucide-react'

interface QuickActionCardsProps {
  loading?: boolean
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate'
  onClick: () => void
  loading?: boolean
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  onClick,
  loading = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
    yellow: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6">
        <div className="animate-pulse">
          <div className="skeleton h-8 w-8 rounded-lg mb-4"></div>
          <div className="skeleton h-4 w-24 rounded mb-2"></div>
          <div className="skeleton h-3 w-32 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className="surface-card-elevated p-6 text-left hover-lift group transition-all duration-200 w-full"
    >
      <div className={`inline-flex p-3 rounded-xl border ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
      
      <div className="mt-4 text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
        Manage →
      </div>
    </button>
  )
}

export default function QuickActionCards({ loading = false }: QuickActionCardsProps) {
  const handleCreateUser = () => {
    window.location.href = '/admin/users/create'
  }

  const handleAssignRole = () => {
    window.location.href = '/admin/roles/assign'
  }

  const handleResetPassword = () => {
    window.location.href = '/admin/users/reset-password'
  }

  const handleConfigureProcess = () => {
    window.location.href = '/admin/processes/configure'
  }

  const handleFeatureFlags = () => {
    window.location.href = '/admin/features'
  }

  const handleSLAManagement = () => {
    window.location.href = '/admin/sla'
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Create User"
          description="Add new system users and assign initial credentials"
          icon={<UserPlus className="h-6 w-6" />}
          color="blue"
          onClick={handleCreateUser}
          loading={loading}
        />
        
        <QuickActionCard
          title="Assign Role"
          description="Modify user roles and permissions across the system"
          icon={<UserCheck className="h-6 w-6" />}
          color="green"
          onClick={handleAssignRole}
          loading={loading}
        />
        
        <QuickActionCard
          title="Reset Password"
          description="Reset user passwords and manage authentication"
          icon={<Key className="h-6 w-6" />}
          color="yellow"
          onClick={handleResetPassword}
          loading={loading}
        />
        
        <QuickActionCard
          title="Configure Process"
          description="Define workflows and approval processes"
          icon={<Settings className="h-6 w-6" />}
          color="purple"
          onClick={handleConfigureProcess}
          loading={loading}
        />
        
        <QuickActionCard
          title="Feature Flags"
          description="Enable/disable system features and modules"
          icon={<Flag className="h-6 w-6" />}
          color="red"
          onClick={handleFeatureFlags}
          loading={loading}
        />
        
        <QuickActionCard
          title="SLA Management"
          description="Configure service level agreements and timelines"
          icon={<Clock className="h-6 w-6" />}
          color="slate"
          onClick={handleSLAManagement}
          loading={loading}
        />
      </div>
    </div>
  )
}
