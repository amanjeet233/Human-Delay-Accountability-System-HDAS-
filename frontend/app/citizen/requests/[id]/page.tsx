'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import CitizenLayout from '@/components/layout/CitizenLayout';

export default function CitizenRequestDetail() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.CITIZEN)) {
      router.replace('/unauthorized');
      return;
    }
    if (params.id) {
      loadRequest(params.id as string);
    }
  }, [isAuthenticated, canAccessDashboard, router, params.id]);

  const loadRequest = async (id: string) => {
    try {
      const response = await apiClient.get(`/requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertTriangle className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || !canAccessDashboard(SystemRole.CITIZEN)) {
    return null;
  }

  if (loading) {
    return (
      <CitizenLayout
        userId={user?.username ?? 'CITIZEN'}
        userName={user?.username ?? 'Citizen'}
        department="Public Services"
        currentPage="Request Detail"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      </CitizenLayout>
    );
  }

  if (!request) {
    return (
      <CitizenLayout
        userId={user?.username ?? 'CITIZEN'}
        userName={user?.username ?? 'Citizen'}
        department="Public Services"
        currentPage="Request Detail"
      >
        <div className="text-center py-8">
          <p className="text-slate-500">Request not found.</p>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout
      userId={user?.username ?? 'CITIZEN'}
      userName={user?.username ?? 'Citizen'}
      department="Public Services"
      currentPage="Request Detail"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Request Details</h1>
        </div>

        {/* Request Info */}
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Request Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">ID:</span>
                  <span className="text-slate-600">{request.id}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Title:</span>
                  <span className="text-slate-600">{request.title}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Created:</span>
                  <span className="text-slate-600">{new Date(request.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Process Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Process:</span>
                  <span className="text-slate-600">{request.process?.name || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">SLA:</span>
                  <span className="text-slate-600">{request.sla ? `${request.sla.duration} days` : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600">{request.description}</p>
        </div>

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Attachments</h3>
            <div className="space-y-2">
              {request.attachments.map((attachment: any) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700">{attachment.filename}</span>
                  <button
                    onClick={() => {
                      // TODO: Implement download functionality
                      console.log('Download attachment:', attachment.id);
                    }}
                    className="ml-auto p-1 text-blue-600 hover:text-blue-800"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Request Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Request Submitted</div>
                <div className="text-sm text-slate-600">{request.description}</div>
                <div className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleString()}</div>
              </div>
            </div>
            {request.status !== 'PENDING' && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Under Review</div>
                  <div className="text-sm text-slate-600">Your request is being processed</div>
                  <div className="text-xs text-slate-500">{new Date(request.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
