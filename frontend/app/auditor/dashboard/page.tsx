'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, Download, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, User, Settings, Key, UserCheck } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import AuditorLayout from '@/components/layout/AuditorLayout';
import { FeatureGrid } from '@/components/auditor/FeatureGrid';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  description: string;
  performedBy: string;
  performedAt: string;
  ipAddress: string;
  userAgent: string;
  severity?: string;
  legalHold?: boolean;
}

export default function AuditorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
      router.replace('/unauthorized');
      return;
    }
    loadAuditLogs();
  }, [isAuthenticated, canAccessDashboard, router]);

  const loadAuditLogs = async () => {
    try {
      const response = await apiClient.get('/auditor/audit-logs');
      setAuditLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'USER_CREATED': return 'bg-green-100 text-green-800';
      case 'USER_ROLE_UPDATED': return 'bg-blue-100 text-blue-800';
      case 'PASSWORD_RESET': return 'bg-yellow-100 text-yellow-800';
      case 'REQUEST_CREATED': return 'bg-purple-100 text-purple-800';
      case 'SLA_BREACH': return 'bg-red-100 text-red-800';
      case 'PROCESS_CONFIGURED': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_CREATED': return <UserCheck className="h-4 w-4" />;
      case 'USER_ROLE_UPDATED': return <User className="h-4 w-4" />;
      case 'PASSWORD_RESET': return <Key className="h-4 w-4" />;
      case 'REQUEST_CREATED': return <FileText className="h-4 w-4" />;
      case 'SLA_BREACH': return <AlertTriangle className="h-4 w-4" />;
      case 'PROCESS_CONFIGURED': return <Settings className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Action', 'Entity', 'Description', 'Performed By', 'Performed At', 'IP Address', 'User Agent'],
      ...auditLogs.map(log => [
        log.id,
        log.action,
        log.entity,
        log.description,
        log.performedBy,
        new Date(log.performedAt).toLocaleString(),
        log.ipAddress,
        log.userAgent
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const userActions = auditLogs.filter(log => log.entity === 'User').length;
    const requestActions = auditLogs.filter(log => log.entity === 'Request').length;
    const processActions = auditLogs.filter(log => log.entity === 'Process').length;
    const slaBreaches = auditLogs.filter(log => log.action === 'SLA_BREACH').length;
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = auditLogs.filter(log => log.performedAt.startsWith(today)).length;

    return {
      userActions,
      requestActions,
      processActions,
      slaBreaches,
      todayLogs,
      total: auditLogs.length
    };
  };

  const stats = getStats();

  if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
    return null;
  }

  return (
    <AuditorLayout
      userId={user?.username ?? 'AUDITOR'}
      userName={user?.username ?? 'Auditor'}
      department="Audit & Compliance"
      currentPage="Dashboard"
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Logs</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.userActions}</div>
              <div className="text-sm text-slate-600">User Actions</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.requestActions}</div>
              <div className="text-sm text-slate-600">Request Actions</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.processActions}</div>
              <div className="text-sm text-slate-600">Process Actions</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.slaBreaches}</div>
              <div className="text-sm text-slate-600">SLA Breaches</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.todayLogs}</div>
              <div className="text-sm text-slate-600">Today's Logs</div>
            </div>
          </div>
        </section>

        {/* Export Controls */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Audit Logs</h2>
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* Recent Audit Logs Table */}
        <section>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Entity</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Legal Hold</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mx-auto"></div>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.slice(0, 10).map((log) => (
                      <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{new Date(log.performedAt).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-700">{log.performedBy}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.entity}</td>
                        <td className="py-3 px-4 text-slate-700">{log.description}</td>
                        <td className="py-3 px-4">
                          {log.legalHold ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">YES</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">NO</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Future Features Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Future Features</h2>
          <FeatureGrid />
        </section>
      </div>
    </AuditorLayout>
  );
}
