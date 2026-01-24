'use client'

import React, { useState } from 'react'
import { CheckCircle, ArrowRight, AlertTriangle, Clock, MessageSquare } from 'lucide-react'

interface ClerkTaskActionsProps {
  taskId: string
  taskStatus: 'assigned' | 'working'
  onVerify?: () => void
  onForward?: () => void
  onAddDelayReason?: () => void
  loading?: boolean
}

interface DelayReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, estimatedDelay: number) => void
  loading?: boolean
}

const DelayReasonModal: React.FC<DelayReasonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const [reason, setReason] = useState('')
  const [estimatedDelay, setEstimatedDelay] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim() && estimatedDelay) {
      onSubmit(reason.trim(), parseInt(estimatedDelay))
      setReason('')
      setEstimatedDelay('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 surface-card-elevated">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Report Delay</h3>
            <p className="text-sm text-slate-600">Provide reason for task delay</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delay Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Explain the reason for delay..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estimated Additional Delay (hours)
            </label>
            <input
              type="number"
              value={estimatedDelay}
              onChange={(e) => setEstimatedDelay(e.target.value)}
              className="input"
              min="1"
              max="168"
              placeholder="Enter hours..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-danger"
              disabled={loading || !reason.trim() || !estimatedDelay}
            >
              {loading ? 'Submitting...' : 'Submit Delay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClerkTaskActions({ 
  taskId, 
  taskStatus, 
  onVerify, 
  onForward, 
  onAddDelayReason,
  loading = false 
}: ClerkTaskActionsProps) {
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleVerify = async () => {
    setActionLoading(true)
    try {
      if (onVerify) {
        await onVerify()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleForward = async () => {
    setActionLoading(true)
    try {
      if (onForward) {
        await onForward()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelaySubmit = async (reason: string, estimatedDelay: number) => {
    setActionLoading(true)
    try {
      if (onAddDelayReason) {
        await onAddDelayReason(reason, estimatedDelay)
      }
      setShowDelayModal(false)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex space-x-2">
        <div className="skeleton h-10 w-24 rounded-lg"></div>
        <div className="skeleton h-10 w-24 rounded-lg"></div>
        <div className="skeleton h-10 w-32 rounded-lg"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {taskStatus === 'assigned' && (
          <button
            onClick={handleVerify}
            disabled={actionLoading}
            className="btn-success flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{actionLoading ? 'Verifying...' : 'Verify'}</span>
          </button>
        )}

        <button
          onClick={handleForward}
          disabled={actionLoading}
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span>{actionLoading ? 'Forwarding...' : 'Forward'}</span>
        </button>

        <button
          onClick={() => setShowDelayModal(true)}
          disabled={actionLoading}
          className="btn-danger flex items-center space-x-2"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Add Delay Reason</span>
        </button>
      </div>

      <DelayReasonModal
        isOpen={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        onSubmit={handleDelaySubmit}
        loading={actionLoading}
      />
    </>
  )
}

// Quick Action Card Component
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  color: 'green' | 'blue' | 'red'
  loading?: boolean
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  color,
  loading = false
}) => {
  const colorClasses = {
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
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
      onClick={() => onClick()}
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
        Action →
      </div>
    </button>
  )
}
