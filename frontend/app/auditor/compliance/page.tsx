'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Download, FileText, BarChart3 } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import AuditorLayout from '@/components/layout/AuditorLayout';
import { FeatureCard } from '@/components/FeatureCard';

export default function AuditorCompliance() {
  const router = useRouter();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
      router.replace('/unauthorized');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, canAccessDashboard, router]);

  if (!isAuthenticated || !canAccessDashboard(SystemRole.AUDITOR)) {
    return null;
  }

  return (
    <AuditorLayout
      userId={user?.username ?? 'AUDITOR'}
      userName={user?.username ?? 'Auditor'}
      department="Audit & Compliance"
      currentPage="Compliance"
    >
      <div className="space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Reports</h1>
          <p className="text-slate-600">Generate compliance reports and export legal evidence.</p>
        </section>

        {/* Available Reports */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              flag="auditCompliance"
              title="Compliance Reports"
              description="Generate detailed compliance and audit reports."
              icon={<BarChart3 className="text-2xl" />}
            />
            <FeatureCard
              flag="legalEvidenceExport"
              title="Legal Evidence Export"
              description="Export audit trails as legal evidence (PDF/CSV)."
              icon={<FileText className="text-2xl" />}
            />
          </div>
        </section>

        {/* Quick Export */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Export</h2>
          <div className="glass-card p-6">
            <p className="text-slate-600 mb-4">Export basic audit logs (always available).</p>
            <button
              onClick={() => router.push('/auditor/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Audit Logs
            </button>
          </div>
        </section>
      </div>
    </AuditorLayout>
  );
}
