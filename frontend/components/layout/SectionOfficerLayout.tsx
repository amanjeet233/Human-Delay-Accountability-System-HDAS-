'use client'

import React, { useState } from 'react'
import { 
  Home, 
  LogOut, 
  Menu, 
  X, 
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'

interface SectionOfficerLayoutProps {
  children: React.ReactNode
  userId: string
  userName: string
  department?: string
  currentPage: string
}

const sectionOfficerNavigation = [
  { name: 'Dashboard', href: '/so/dashboard', icon: Home },
  { name: 'Review Queue', href: '/so/review/queue', icon: FileText },
  { name: 'Approvals', href: '/so/review/approvals', icon: CheckCircle },
  { name: 'Escalations', href: '/so/escalations', icon: AlertTriangle },
]

export default function SectionOfficerLayout({ 
  children, 
  userId, 
  userName, 
  department,
  currentPage 
}: SectionOfficerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">HD</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">HDAS</h1>
                    <p className="text-xs text-slate-500">Human Delay Accountability System</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Page Title */}
            <div className="hidden md:block">
              <h2 className="text-lg font-medium text-slate-700">{currentPage}</h2>
            </div>

            {/* Right side - Actions and User */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/so/dashboard'}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Home"
              >
                <Home className="h-4 w-4" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>

              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">SECTION OFFICER • {userId}</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 bottom-0 z-40 w-64 glass-card border-r border-white/20 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <nav className="p-4 space-y-1">
          {sectionOfficerNavigation.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.name
            
            return (
              <a
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </a>
            )
          })}
        </nav>

        {/* Section Officer Info Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Section Officer Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="text-sm font-medium text-slate-900">SECTION OFFICER</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Login ID</p>
                <p className="text-sm font-medium text-slate-900">{userId}</p>
              </div>
              {department && (
                <div>
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="text-sm font-medium text-slate-900">{department}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">Last Login</p>
                <p className="text-sm font-medium text-slate-900">Today, 09:15 AM</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Access Level</p>
                <p className="text-xs text-slate-600">Review & Decision Making</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
