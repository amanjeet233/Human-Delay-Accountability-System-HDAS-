import { NextRequest, NextResponse } from 'next/server';

// Backend API endpoints mapping
const BACKEND_APIS = {
  // Auth endpoints
  '/api/auth/login': 'POST',
  '/api/auth/health': 'GET',
  '/api/auth/me': 'GET',
  '/api/auth/users': 'GET',
  
  // Request endpoints  
  '/api/requests': 'GET,POST',
  '/api/requests/{id}': 'GET,PUT',
  '/api/requests/{id}/timeline': 'GET',
  '/api/requests/{id}/assignments': 'GET',
  '/api/requests/assignments/{assignmentId}/start': 'POST',
  '/api/requests/assignments/{assignmentId}/complete': 'POST',
  '/api/requests/{requestId}/attachments': 'GET,POST',
  '/api/requests/attachments/{id}/download': 'GET',
  
  // Escalation endpoints
  '/api/escalations/rules': 'GET,POST',
  '/api/escalations/history/assignment/{assignmentId}': 'GET',
  
  // Feature flag endpoints
  '/api/admin/feature-flags': 'GET,POST',
  '/api/admin/feature-flags/{name}': 'GET,PUT,DELETE',
  '/api/admin/feature-flags/{name}/enable': 'PUT',
  '/api/admin/feature-flags/{name}/disable': 'PUT',
  '/api/admin/feature-flags/enabled': 'GET',
  '/api/admin/feature-flags/category/{category}': 'GET',
  '/api/admin/feature-flags/role/{role}': 'GET',
  '/api/admin/feature-flags/check/{name}': 'GET',
  '/api/admin/feature-flags/initialize': 'POST',
  
  // Process endpoints
  '/api/processes': 'GET,POST',
  '/api/processes/{id}': 'GET,PUT',
  '/api/processes/{id}/steps': 'POST',
  
  // User endpoints
  '/api/users': 'GET,POST',
  '/api/users/{id}': 'GET,PUT,DELETE',
  
  // Role endpoints
  '/api/roles': 'GET,POST',
  '/api/roles/{id}': 'GET,PUT',
  
  // SLA endpoints
  '/api/slas': 'GET,POST',
  '/api/slas/step/{stepId}': 'GET',
  '/api/slas/{id}': 'PUT',
  
  // Compliance endpoints
  '/api/compliance/delays/{delayId}/justify': 'POST',
  '/api/compliance/justifications': 'GET',
  '/api/compliance/justifications/{id}/approve': 'POST',
  '/api/compliance/audit-reports/csv': 'GET',
  '/api/compliance/audit-reports/pdf': 'GET',
  
  // Accountability endpoints
  '/api/accountability/delegations': 'POST',
  '/api/accountability/delegations/assignment/{assignmentId}': 'GET',
  '/api/accountability/delay-debt/{userId}': 'GET,POST',
  
  // Governance endpoints
  '/api/governance/exclusion-rules': 'GET,POST',
  '/api/governance/bottlenecks/{processId}': 'GET',
  '/api/governance/simulate/{processId}': 'POST',
  
  // Transparency endpoints
  '/api/public/statistics': 'GET',
  '/api/public/process-performance': 'GET',
  
  // Delay endpoints
  '/api/delays': 'GET',
  '/api/delays/assignment/{assignmentId}': 'GET',
  '/api/delays/{id}/justify': 'POST',
  
  // Audit endpoints
  '/api/audit/logs': 'GET',
  '/api/audit/metrics': 'GET',
  '/api/audit/reports': 'GET,POST',
};

// Frontend pages mapping
const FRONTEND_PAGES = [
  '/login',
  '/dashboard',
  '/admin/dashboard',
  '/admin/feature-flags',
  '/requests',
  '/requests/create',
  '/requests/[id]',
  '/escalations',
  '/governance',
  '/accountability',
  '/compliance',
  '/transparency',
  '/dashboard/auditor',
  '/analytics',
  '/processes',
];

// Feature flag to endpoint mapping
const FEATURE_FLAG_ENDPOINTS = {
  escalation: ['/api/escalations/rules', '/api/escalations/history/assignment/{assignmentId}'],
  auditCompliance: ['/api/compliance/delays/{delayId}/justify', '/api/compliance/justifications', '/api/compliance/audit-reports/csv', '/api/compliance/audit-reports/pdf'],
  advancedAccountability: ['/api/accountability/delegations', '/api/accountability/delegations/assignment/{assignmentId}', '/api/accountability/delay-debt/{userId}'],
  governanceAnalysis: ['/api/governance/exclusion-rules', '/api/governance/bottlenecks/{processId}', '/api/governance/simulate/{processId}'],
  transparency: ['/api/public/statistics', '/api/public/process-performance'],
};

// Page to required feature flag mapping
const PAGE_FEATURE_REQUIREMENTS = {
  '/escalations': 'escalation',
  '/accountability': 'advancedAccountability', 
  '/compliance': 'auditCompliance',
  '/dashboard/auditor': 'auditCompliance',
  '/transparency': 'transparency',
  '/governance': 'governanceAnalysis',
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const checkType = url.searchParams.get('type') || 'all';
  
  switch (checkType) {
    case 'backend':
      return NextResponse.json({
        apis: BACKEND_APIS,
        count: Object.keys(BACKEND_APIS).length
      });
      
    case 'frontend':
      return NextResponse.json({
        pages: FRONTEND_PAGES,
        count: FRONTEND_PAGES.length
      });
      
    case 'features':
      return NextResponse.json({
        featureEndpoints: FEATURE_FLAG_ENDPOINTS,
        pageRequirements: PAGE_FEATURE_REQUIREMENTS
      });
      
    case 'violations':
      const violations = validateParity();
      return NextResponse.json(violations);
      
    case 'all':
    default:
      return NextResponse.json({
        backend: { apis: BACKEND_APIS, count: Object.keys(BACKEND_APIS).length },
        frontend: { pages: FRONTEND_PAGES, count: FRONTEND_PAGES.length },
        features: { featureEndpoints: FEATURE_FLAG_ENDPOINTS, pageRequirements: PAGE_FEATURE_REQUIREMENTS },
        violations: validateParity()
      });
  }
}

function validateParity() {
  const violations = {
    frontendWithoutBackend: [] as string[],
    backendWithoutFrontend: [] as string[],
    featureFlagMismatches: [] as string[]
  };
  
  // Check for frontend pages that might not have corresponding backend APIs
  const frontendPages = new Set(FRONTEND_PAGES);
  
  // Check for backend endpoints that might not have corresponding frontend pages
  const backendPaths = new Set(Object.keys(BACKEND_APIS).map(path => path.split('/')[1]));
  
  // Simple heuristic checks (would need more sophisticated analysis in production)
  if (frontendPages.has('/escalations') && !backendPaths.has('escalations')) {
    violations.frontendWithoutBackend.push('/escalations page exists but /api/escalations endpoints may be missing');
  }
  
  if (frontendPages.has('/governance') && !backendPaths.has('governance')) {
    violations.frontendWithoutBackend.push('/governance page exists but /api/governance endpoints may be missing');
  }
  
  if (frontendPages.has('/accountability') && !backendPaths.has('accountability')) {
    violations.frontendWithoutBackend.push('/accountability page exists but /api/accountability endpoints may be missing');
  }
  
  // Check for feature flag mismatches
  Object.entries(PAGE_FEATURE_REQUIREMENTS).forEach(([page, feature]) => {
    if (!FEATURE_FLAG_ENDPOINTS[feature as keyof typeof FEATURE_FLAG_ENDPOINTS]) {
      violations.featureFlagMismatches.push(`Page ${page} requires feature ${feature} but no endpoints defined for this feature`);
    }
  });
  
  return violations;
}
