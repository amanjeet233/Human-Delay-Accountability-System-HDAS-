# HDAS Technical Demo Script (8-10 minutes)

## Demo Overview
This script demonstrates the complete HDAS workflow across all roles, showcasing role-based permissions, feature flags, and the "Coming Soon" functionality.

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000`
- Browser with multiple profiles or incognito windows

---

## Demo Script

### 0:00 - 0:30 | Introduction & System Overview
**Narrator:** "Welcome to the Human Delay Accountability System (HDAS) demo. Today we'll showcase the complete workflow across all user roles, demonstrating strict role-based access control, feature flag management, and our 'Coming Soon' approach for future functionality."

**Screens to Show:**
- Login page with role selection
- System architecture diagram
- Feature flag dashboard (Admin view)

---

### 0:30 - 1:30 | Citizen Role - Request Submission
**Narrator:** "Let's start with our citizens. Citizens can submit service requests and track their status. Watch as we create a land registration request."

**Actions:**
1. Login as `citizen@hdas.com` / `password123`
2. Navigate to Dashboard
3. Click "New Request"
4. Fill form:
   - Title: "Land Registration for Residential Property"
   - Description: "Application for land registration of residential property at 123 Main Street"
   - Process Type: "Land Registration"
5. Submit request

**Screens to Show:**
- Citizen dashboard with request list
- New request modal
- Request confirmation
- Updated request list with new entry

**Coming Soon Feature:** Citizen notifications (disabled card)

---

### 1:30 - 2:30 | Clerk Role - Verification & Forwarding
**Narrator:** "Now let's switch to our clerks. Clerks verify citizen requests and forward them to section officers. Notice the clean separation of concerns."

**Actions:**
1. Open new browser tab/incognito window
2. Login as `clerk@hdas.com` / `password123`
3. Navigate to Dashboard
4. View assigned requests
5. Select the land registration we just created
6. Click "Verify" - add verification note: "Documents verified and complete"
7. Click "Forward" - forward to Section Officer with note: "Ready for review"

**Screens to Show:**
- Clerk dashboard with assigned requests
- Request details view
- Verification modal
- Forward modal
- Updated request status

**Coming Soon Feature:** Advanced delay reason UI (disabled card)

---

### 2:30 - 3:30 | Section Officer - Review & Approval
**Narrator:** "Our section officers are the first level of approval. They can approve, reject, or forward requests to HODs. Let's approve our land registration."

**Actions:**
1. Open new browser tab/incognito window
2. Login as `so@hdas.com` / `password123`
3. Navigate to Dashboard
4. View Review Queue
5. Find the forwarded land registration request
6. Click "Approve" - add approval note: "Land registration approved per policy"
7. Confirm approval

**Screens to Show:**
- Section Officer dashboard
- Review queue with SLA indicators
- Approval modal
- Request status change
- Updated dashboard metrics

**Coming Soon Feature:** Enhanced review queue (disabled card)

---

### 3:30 - 4:30 | HOD Role - Final Decision
**Narrator:** "Heads of Department provide final approval. They have department-wide oversight and can make final decisions. Let's review and approve this request."

**Actions:**
1. Open new browser tab/incognito window
2. Login as `hod@hdas.com` / `password123`
3. Navigate to Dashboard
4. View Final Approval Queue
5. Select the approved land registration
6. Click "Approve" - add final note: "Final approval granted"
7. Confirm final approval

**Screens to Show:**
- HOD dashboard with department metrics
- Final approval queue
- Final approval modal
- SLA breach summary
- Request completion

**Coming Soon Feature:** Final decision workflow (disabled card)

---

### 4:30 - 5:30 | Auditor Role - Audit & Compliance
**Narrator:** "Our auditors provide oversight and compliance monitoring. They have read-only access to audit logs and can place legal holds. Let's examine the audit trail."

**Actions:**
1. Open new browser tab/incognito window
2. Login as `auditor@hdas.com` / `password123`
3. Navigate to Dashboard
4. View audit logs
5. Filter by our land registration request ID
6. Place legal hold on the request
7. Export audit logs as CSV

**Screens to Show:**
- Auditor dashboard with KPI cards
- Audit logs table with filters
- Legal hold modal
- Export functionality
- Compliance reports (disabled)

**Coming Soon Feature:** Advanced audit querying (disabled card)

---

### 5:30 - 6:30 | Admin Role - System Management
**Narrator:** "Finally, our administrators have full system control. They manage users, configure processes, and control feature flags. Let's enable a new feature."

**Actions:**
1. Open new browser tab/incognito window
2. Login as `admin@hdas.com` / `password123`
3. Navigate to Users Management
4. Show user list and role assignments
5. Navigate to Feature Flags
6. Enable "Real-time Notifications" feature flag
7. Verify feature activation

**Screens to Show:**
- Admin dashboard with system metrics
- User management interface
- Feature flags toggle interface
- Feature activation confirmation
- Updated feature status

**Coming Soon Feature:** AI delay prediction (disabled card)

---

### 6:30 - 7:30 | Feature Flag Demonstration
**Narrator:** "Let's see our feature flag system in action. I'll show how disabled features appear to users and how they change when enabled."

**Actions:**
1. As Clerk, try to access advanced delay reason UI
2. Show "Coming Soon" overlay and toast
3. As Admin, enable "Advanced Delay Reason UI" feature
4. As Clerk, refresh and access the now-enabled feature
5. Demonstrate the new advanced interface
6. Disable the feature again to show rollback

**Screens to Show:**
- Disabled feature card with overlay
- Toast notification for blocked access
- Admin feature flag toggle
- Enabled feature interface
- Rollback demonstration

---

### 7:30 - 8:00 | Cross-Role Workflow & SLA Monitoring
**Narrator:** "Let's demonstrate our complete workflow and SLA monitoring. We'll create a new request and track it through the entire system."

**Actions:**
1. As Citizen, submit new "Certificate Request"
2. As Clerk, verify and forward the request
3. As Section Officer, approve the request
4. As HOD, provide final approval
5. As Auditor, view the complete audit trail
6. Show SLA compliance metrics throughout

**Screens to Show:**
- End-to-end request lifecycle
- SLA timers and warnings
- Role handoff points
- Complete audit trail
- Compliance dashboard

---

### 8:00 - 8:30 | Security & Compliance Features
**Narrator:** "Security and compliance are core to HDAS. Let's demonstrate our security features, audit logging, and legal hold capabilities."

**Actions:**
1. Show role-based access control (try unauthorized access)
2. Demonstrate audit log generation
3. Show legal hold placement and release
4. Display compliance reports
5. Show data export capabilities
6. Demonstrate session management

**Screens to Show:**
- Unauthorized access blocking
- Audit log entries
- Legal hold management
- Compliance reports
- Export functionality
- Session security

---

### 8:30 - 9:00 | Conclusion & Q&A
**Narrator:** "We've demonstrated the complete HDAS system across all roles, showing our robust role-based access control, feature flag management, and comprehensive audit capabilities. The system ensures transparency, accountability, and efficient service delivery."

**Final Screens to Show:**
- System summary dashboard
- Role permission matrix
- Feature flag status overview
- Contact information for Q&A

---

## Technical Notes for Demo

### Database States
- Requests flow through statuses: PENDING → PENDING_CLERK_REVIEW → VERIFIED → PENDING_SO_REVIEW → APPROVED → PENDING_HOD_APPROVAL → COMPLETED
- Each action creates audit log entries
- SLA timers track at each stage

### Feature Flags Used
- `realTimeNotifications` - Enabled during demo
- `clerkDelayReasonUI` - Enabled during demo
- All others remain disabled (showing "Coming Soon")

### Security Demonstrated
- JWT-based authentication
- Role-based access control
- Permission-based action authorization
- Audit trail for all actions

### "Coming Soon" Features Highlighted
1. **Real-time Notifications** - Enabled during demo
2. **Advanced Delay Reason UI** - Enabled during demo
3. **AI Delay Prediction** - Shown as disabled
4. **Advanced Audit Querying** - Shown as disabled
5. **Mobile App Configuration** - Shown as disabled

---

## Demo Success Metrics
- ✅ All 6 roles demonstrated
- ✅ Complete request lifecycle shown
- ✅ Feature flag system demonstrated
- ✅ Security and compliance features shown
- ✅ "Coming Soon" functionality explained
- ✅ No broken links or errors
- ✅ Smooth transitions between roles

**Total Demo Time: 9 minutes**
