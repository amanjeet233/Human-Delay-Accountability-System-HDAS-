'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { requestsApi } from '@/lib/api';
import type { Request } from '@/lib/api';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await requestsApi.getAll();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Requests</h1>
              <p className="text-gray-600">Manage and track all process requests</p>
            </div>
            <button
              onClick={() => router.push('/requests/create')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </button>
          </div>

          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="glass-card hover:bg-white/80 transition-colors cursor-pointer"
                onClick={() => router.push(`/requests/${request.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Process: {request.process.name} {request.process.version}</span>
                      <span>Created: {new Date(request.startedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    request.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No requests found</p>
                <button
                  onClick={() => router.push('/requests/create')}
                  className="btn-primary"
                >
                  Create Your First Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
