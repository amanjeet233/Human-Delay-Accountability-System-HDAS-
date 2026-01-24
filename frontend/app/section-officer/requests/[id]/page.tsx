'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Clock, User, FileText, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useAuth, SystemRole, apiClient } from '@/lib';
import SectionOfficerLayout from '@/components/layout/SectionOfficerLayout';

export default function SectionOfficerRequestDetail() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, canAccessDashboard } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !canAccessDashboard(SystemRole.SECTION_OFFICER)) {
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

  const handleApprove = async () => {
    try {
      await apiClient.put(`/so/requests/${request.id}/approve`, { notes: '' });
      router.push('/so/dashboard');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async () => {
    try {
      await apiClient.put(`/so/requests/${request.id}/reject`, { reason: 'Rejected by section officer', notes: '' });
      router.push('/so/dashboard');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleForward = async () => {
    try {
      await apiClient.put(`/so/requests/${request.id}/forward`, { to: 'HOD', notes: '' });
      router.push('/so/dashboard');
    } catch (error) {
      console.error('Failed to forward request:', error);
    }
  };

  if (!isAuthenticated || !canAccessDashboard(SystemRole.SECTION_OFFICER)) {
    return null;
  }

  if (loading) {
    return (
      <SectionOfficerLayout
        userId={user?.username ?? 'SECTION_OFFICER'}
        userName={user?.username ?? 'Section Officer'}
        department="Section Office"
        currentPage="Request Detail"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
        </div>
      </SectionOfficerLayout>
    );
  }

  if (!request) {
    return (
      <SectionOfficerLayout
        userId={user?.username ?? 'SECTION_OFFICER'}
        userName={user?.username ?? 'Section Officer'}
        department="Section Office"
        currentPage="Request Detail"
      >
        <div className="text-center py-8">
          <p className="text-slate-500">Request not found.</p>
        </div>
      </SectionOfficerLayout>
    );
  }

  return (
    <SectionOfficerLayout
      userId={user?.username ?? 'SECTION_OFFICER'}
      userName={user?.username ?? 'Section Officer'}
      department="Section Office"
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
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Created:</span>
                  <span className="text-slate-600">{new Date(request.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Applicant Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Name:</span>
                  <span className="text-slate-600">{request.createdBy}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Email:</span>
                  <span className="text-slate-600">{request.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-slate-700 w-24">Phone:</span>
                  <span className="text-slate-600">{request.phone || 'N/A'}</span>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {request.status === 'PENDING' || request.status === 'IN_PROGRESS' ? (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleForward}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Forward to HOD
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </SectionOfficerLayout>
  );
}
