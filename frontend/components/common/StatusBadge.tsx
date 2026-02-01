import React from 'react';

type Props = {
  status: string;
};

const colorMap: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700 border border-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border border-blue-200',
  SUBMITTED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  APPROVED: 'bg-green-100 text-green-700 border border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  DELAYED: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
};

export default function StatusBadge({ status }: Props) {
  const key = (status || 'PENDING').toUpperCase();
  const cls = colorMap[key] || 'bg-gray-100 text-gray-700 border border-gray-200';
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{key}</span>
  );
}
