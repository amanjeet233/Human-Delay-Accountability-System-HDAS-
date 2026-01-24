'use client';

import React from 'react';
import { FeatureCard } from '../FeatureCard';

export const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        flag="auditorAdvancedQuerying"
        title="Advanced Audit Querying"
        description="Powerful search and filtering for audit logs and reports."
        icon={<span className="text-2xl">🔎</span>}
      />
      <FeatureCard
        flag="auditCompliance"
        title="Compliance Reports"
        description="Generate and export compliance and audit reports."
        icon={<span className="text-2xl">📑</span>}
      />
      <FeatureCard
        flag="legalEvidenceExport"
        title="Legal Evidence Export"
        description="Export audit trails as legal evidence (PDF/CSV)."
        icon={<span className="text-2xl">🗂️</span>}
      />
    </div>
  );
};
