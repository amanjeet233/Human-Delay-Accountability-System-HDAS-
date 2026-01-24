'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import { requestsApi, assignmentsApi } from '@/lib/api';
import type { Request, Assignment } from '@/lib/api';
import { apiClient } from '@/lib';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [request, setRequest] = useState<Request | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const [requestData, assignmentsData] = await Promise.all([
        requestsApi.getById(requestId),
        apiClient.get<Assignment[]>(`/requests/${requestId}/assignments`).then(r => r.data as Assignment[]).catch(() => []),
      ]);
      setRequest(requestData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      await assignmentsApi.start(assignmentId);
      loadRequest();
    } catch (error) {
      console.error('Failed to start assignment:', error);
    }
  };

  const handleCompleteAssignment = async (assignmentId: string, action: string) => {
    try {
      await assignmentsApi.complete(assignmentId, action);
      loadRequest();
    } catch (error) {
      console.error('Failed to complete assignment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.title}</h1>
              <p className="text-gray-600">{request.process.name} - {request.process.version}</p>
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

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Created By</p>
              <p className="font-medium text-gray-900">{request.createdBy.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Started At</p>
              <p className="font-medium text-gray-900">
                {new Date(request.startedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={assignment.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Step {assignment.processStep.sequenceOrder}: {assignment.processStep.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        assignment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        assignment.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Assigned to: {assignment.assignedTo.username}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Assigned: {new Date(assignment.assignedAt).toLocaleString()}</p>
                      {assignment.startedAt && (
                        <p>Started: {new Date(assignment.startedAt).toLocaleString()}</p>
                      )}
                      {assignment.completedAt && (
                        <p>Completed: {new Date(assignment.completedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {assignment.status === 'PENDING' && (
                      <button
                        onClick={() => handleStartAssignment(assignment.id)}
                        className="btn-primary text-sm"
                      >
                        Start
                      </button>
                    )}
                    {assignment.status === 'IN_PROGRESS' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCompleteAssignment(assignment.id, 'APPROVE')}
                          className="btn-primary text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleCompleteAssignment(assignment.id, 'REJECT')}
                          className="btn-secondary text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No assignments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
