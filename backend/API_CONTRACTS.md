# HDAS API Contracts - Frozen Documentation

## Overview
This document captures the final API contracts per role. All URLs, methods, and request/response schemas are frozen and should not be modified without proper governance approval.

---

## ADMIN Role APIs

### Base URL: `/api/admin`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/dashboard` | - | `{message, permissions[], actions[]}` | ✅ STABLE |
| GET | `/analytics/sla-breaches` | - | `{totalBreaches, breachesByRole{}, trend[]}` | ⚠️ FEATURE_FLAGGED |
| GET | `/dashboard/metrics` | - | `{totalRequests, pending, inProgress, delayed, escalated}` | ⚠️ FEATURE_FLAGGED |
| POST | `/ai/delay-prediction` | `{input: {}}` | `{prediction: {riskScore, explanation, recommendedAction}, input}` | ⚠️ FEATURE_FLAGGED |
| POST | `/notifications/test` | `{payload: {}}` | `{message, payload}` | ⚠️ FEATURE_FLAGGED |
| GET | `/mobile-app/config` | - | `{minVersion, forceUpgrade, message}` | ⚠️ FEATURE_FLAGGED |
| POST | `/users` | `{CreateUserRequest}` | `{message, userId, username, role}` | ✅ STABLE |
| PUT | `/users/{id}` | `{UpdateUserRequest}` | `{message, userId, username, role}` | ✅ STABLE |
| DELETE | `/users/{id}` | - | `{message, userId}` | ✅ STABLE |
| PUT | `/users/{id}/role` | `{role: string}` | `{message, userId, username, newRole, updatedBy}` | ✅ STABLE |
| PUT | `/users/{id}/reset-password` | `{newPassword: string}` | `{message, userId, resetBy}` | ✅ STABLE |
| PUT | `/users/{id}/status` | `{active: boolean}` | `{message, userId, active, updatedBy}` | ✅ STABLE |
| POST | `/users/{id}/assign-role` | `{role: string}` | `{message, userId, assignedRole, assignedBy}` | ✅ STABLE |
| GET | `/users` | - | `User[]` | ✅ STABLE |
| POST | `/processes` | `{name, description, steps[]}` | `{message, processId, name, createdBy}` | ✅ STABLE |
| GET | `/processes` | - | `Process[]` | ✅ STABLE |
| POST | `/sla` | `{processStep, allowedHours, allowedDays}` | `{message, slaId, processStep, allowedHours, allowedDays, createdBy}` | ✅ STABLE |
| GET | `/sla` | - | `SLA[]` | ✅ STABLE |
| GET | `/audit-logs` | - | `AuditLog[]` | ✅ STABLE |
| GET | `/analytics` | - | `{summary{}, delaysByRole[], slaByProcess[], monthlyTrends[], roleDistribution[], topDelays[]}` | ✅ STABLE |
| GET | `/escalations` | - | `Escalation[]` | ✅ STABLE |
| POST | `/processes/configure` | `{id, config}` | `{message, processId, configuredBy}` | ✅ STABLE |
| POST | `/feature-flags/toggle` | `{flag, enabled}` | `{message, flag, enabled, toggledBy}` | ✅ STABLE |

---

## SECTION_OFFICER Role APIs

### Base URL: `/api/so`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/requests` | - | `Request[]` | ✅ STABLE |
| GET | `/dashboard` | - | `{totalRequests, pendingReview, escalated, slaBreached, avgProcessingTime}` | ✅ STABLE |
| GET | `/review-queue` | - | `Request[]` | ✅ STABLE |
| GET | `/review-queue/enhanced` | - | `Request[]` | ⚠️ FEATURE_FLAGGED |
| PUT | `/requests/{id}/approve` | `{notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| PUT | `/requests/{id}/reject` | `{notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| PUT | `/requests/{id}/forward` | `{to, notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| GET | `/escalations` | - | `Escalation[]` | ✅ STABLE |
| GET | `/escalations/alerts` | - | `Escalation[]` | ⚠️ FEATURE_FLAGGED |

---

## CLERK Role APIs

### Base URL: `/api/clerk`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/dashboard` | - | `{message, permissions[], actions[]}` | ✅ STABLE |
| GET | `/requests` | - | `Request[]` | ✅ STABLE |
| PUT | `/{id}/verify` | `{verification: {}}` | `{message, requestId, verifiedBy, verifiedAt, verificationDetails}` | ✅ STABLE |
| POST | `/{id}/delay-reason/advanced` | `{reason, category}` | `{message, requestId, payload}` | ⚠️ FEATURE_FLAGGED |
| PUT | `/{id}/verify` | - | `{message, requestId, status, nextStep}` | ✅ STABLE |
| PUT | `/{id}/forward` | `{to, notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| POST | `/{id}/delay-reason` | `{reason: string}` | `{message, requestId, addedBy, addedAt, reason}` | ✅ STABLE |
| GET | `/{id}/timeline` | - | `TimelineEvent[]` | ✅ STABLE |

---

## HOD Role APIs

### Base URL: `/api/hod`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/dashboard` | - | `{message, permissions[], actions[]}` | ✅ STABLE |
| GET | `/requests` | - | `Request[]` | ✅ STABLE |
| GET | `/sla/breach-summary` | - | `{totalBreaches, criticalBreaches, majorBreaches, minorBreaches, monthlyTrend[]}` | ✅ STABLE |
| GET | `/final-approval-queue` | - | `FinalApprovalRequest[]` | ✅ STABLE |
| PUT | `/requests/{id}/approve` | `{notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| PUT | `/requests/{id}/reject` | `{notes?: string}` | `{message, requestId, status, nextStep}` | ✅ STABLE |
| GET | `/escalations` | - | `Escalation[]` | ✅ STABLE |
| GET | `/escalations/alerts` | - | `Escalation[]` | ⚠️ FEATURE_FLAGGED |
| GET | `/final-decision-workflow` | - | `FinalDecisionWorkflow[]` | ⚠️ FEATURE_FLAGGED |

---

## AUDITOR Role APIs

### Base URL: `/api/auditor`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/dashboard` | - | `{message, permissions[], actions[]}` | ✅ STABLE |
| GET | `/audit-logs` | - | `AuditLog[]` | ✅ STABLE |
| GET | `/legal-holds` | - | `LegalHold[]` | ✅ STABLE |
| POST | `/audit-logs/{id}/legal-hold` | `{reason}` | `{message, auditLogId, legalHoldId, placedBy, placedAt}` | ✅ STABLE |
| DELETE | `/audit-logs/{id}/legal-hold` | - | `{message, auditLogId, releasedBy, releasedAt}` | ✅ STABLE |
| GET | `/compliance/reports` | - | `ComplianceReport[]` | ⚠️ FEATURE_FLAGGED |
| GET | `/legal-evidence/export` | - | `{format, status}` | ⚠️ FEATURE_FLAGGED |

---

## CITIZEN Role APIs

### Base URL: `/api/citizen`

| Method | Endpoint | Request Schema | Response Schema | Status |
|--------|----------|----------------|-----------------|---------|
| GET | `/dashboard` | - | `{message, permissions[], actions[]}` | ✅ STABLE |
| GET | `/requests` | - | `Request[]` | ✅ STABLE |
| POST | `/requests` | `{title, description, processId}` | `{message, requestId, status}` | ✅ STABLE |
| GET | `/requests/{id}` | - | `Request` | ✅ STABLE |
| GET | `/requests/{id}/timeline` | - | `TimelineEvent[]` | ✅ STABLE |
| GET | `/notifications` | - | `Notification[]` | ⚠️ FEATURE_FLAGGED |

---

## Feature Flag Status

| Feature Flag | Affected Endpoints | Status |
|--------------|-------------------|---------|
| `slaBreachAnalytics` | `/admin/analytics/sla-breaches` | ⚠️ DISABLED |
| `adminDashboardMetrics` | `/admin/dashboard/metrics` | ⚠️ DISABLED |
| `aiAssistance` | `/admin/ai/delay-prediction` | ⚠️ DISABLED |
| `realTimeNotifications` | `/admin/notifications/test` | ⚠️ DISABLED |
| `mobileApp` | `/admin/mobile-app/config` | ⚠️ DISABLED |
| `soQueueEnhancements` | `/so/review-queue/enhanced` | ⚠️ DISABLED |
| `soEscalationAlerts` | `/so/escalations/alerts` | ⚠️ DISABLED |
| `clerkDelayReasonUI` | `/clerk/{id}/delay-reason/advanced` | ⚠️ DISABLED |
| `hodFinalDecisionWorkflow` | `/hod/final-decision-workflow` | ⚠️ DISABLED |
| `auditorAdvancedQuerying` | `/auditor/advanced-querying` | ⚠️ DISABLED |
| `auditCompliance` | `/auditor/compliance/reports` | ⚠️ DISABLED |
| `legalEvidenceExport` | `/auditor/legal-evidence/export` | ⚠️ DISABLED |
| `citizenNotificationSystem` | `/citizen/notifications` | ⚠️ DISABLED |

---

## Unstable Endpoints

### ⚠️ MARKED FOR REVIEW

| Endpoint | Issue | Priority |
|----------|--------|----------|
| `/admin/ai/delay-prediction` | Mock AI logic | HIGH |
| `/admin/mobile-app/config` | Static config only | LOW |
| `/so/requests/{id}/forward` | Duplicate endpoint (lines 160 & 212) | MEDIUM |

---

## Governance Notes

1. **No Breaking Changes**: All stable endpoints maintain backward compatibility
2. **Feature Flag Enforcement**: Disabled endpoints return 403 with "FEATURE_DISABLED" error
3. **Audit Logging**: All actions are logged for compliance
4. **Security**: Role-based access control enforced on all endpoints
5. **Documentation**: This contract is frozen until next governance review

---

## Confirmation

✅ **API CONTRACTS FROZEN**  
✅ **Feature Flags Documented**  
✅ **Unstable Endpoints Identified**  
✅ **No Breaking Changes Introduced**

*Last Updated: 2025-01-19*  
*Governance Status: APPROVED*
