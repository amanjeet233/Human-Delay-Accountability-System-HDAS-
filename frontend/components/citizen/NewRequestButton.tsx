'use client'

import React from 'react'
import { Plus, FileText } from 'lucide-react'

interface NewRequestButtonProps {
  onClick?: () => void
  loading?: boolean
}

export default function NewRequestButton({ 
  onClick, 
  loading = false 
}: NewRequestButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Default navigation
      window.location.href = '/citizen/requests/new'
    }
  }

  if (loading) {
    return (
      <div className="surface-card-elevated p-6 mb-8">
        <div className="animate-pulse">
          <div className="skeleton h-12 w-48 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <button
        onClick={handleClick}
        className="w-full md:w-auto btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 group"
      >
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Plus className="h-5 w-5" />
        </div>
        <span>Submit New Request</span>
        <FileText className="h-5 w-5 ml-2" />
      </button>
      
      <p className="text-sm text-slate-600 mt-3 text-center md:text-left">
        Start a new government service request with real-time tracking
      </p>
    </div>
  )
}
