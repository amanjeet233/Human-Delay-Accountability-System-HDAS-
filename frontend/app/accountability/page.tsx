'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCapabilities } from '@/lib/hooks/useCapabilities';
import { 
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  Shield,
  LogOut,
  Search,
  Filter,
  Eye,
  Calendar,
  Activity,
  BarChart3,
  Target,
  Zap,
  Timer,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface DelayReason {
  id: string;
  category: string;
  reason: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  frequency: number;
  avgDelayHours: number;
  department: string;
}

interface ShadowDelay {
  id: string;
  requestId: string;
  requestTitle: string;
  actualDelay: number;
  reportedDelay: number;
  shadowHours: number;
  detectedAt: string;
  reportedBy: string;
  verifiedBy?: string;
  status: 'PENDING' | 'VERIFIED' | 'DISPUTED';
  department: string;
}

interface DelayDebt {
  userId: string;
  username: string;
  role: string;
  department: string;
  totalDebtHours: number;
  currentMonthDebt: number;
  lastMonthDebt: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  repeatOffender: boolean;
  topDelayReason: string;
}

interface AccountabilityMetrics {
  totalDelays: number;
  shadowDelays: number;
  avgDelayTime: number;
  delayDebtTotal: number;
  repeatDelayRate: number;
  topDelayingDepartment: string;
  mostCommonReason: string;
  accountabilityScore: number;
}

export default function AccountabilityPage() {
  const router = useRouter();
  const { user, featureFlags, loading, enforceAccess } = useCapabilities();
  const [delayReasons, setDelayReasons] = useState<DelayReason[]>([]);
  const [shadowDelays, setShadowDelays] = useState<ShadowDelay[]>([]);
  const [delayDebt, setDelayDebt] = useState<DelayDebt[]>([]);
  const [metrics, setMetrics] = useState<AccountabilityMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState<'reasons' | 'shadow' | 'debt'>('reasons');
  const [showDetails, setShowDetails] = useState<any>(null);

  // Enforce feature and role access
  if (!enforceAccess('advancedAccountability', ['CLERK', 'SECTION_OFFICER', 'HOD', 'ADMIN', 'AUDITOR'])) {
    return null;
  }

    useEffect(() => {
    // Mock delay reasons data
    setDelayReasons([
      {
        id: 'reason-001',
        category: 'Resource Unavailability',
        reason: 'Staff Shortage',
        description: 'Insufficient staff available to handle workload',
        impact: 'HIGH',
        frequency: 45,
        avgDelayHours: 8.5,
        department: 'Finance'
      },
      {
        id: 'reason-002',
        category: 'Process Issues',
        reason: 'Complex Approval Required',
        description: 'Request requires multi-level approval process',
        impact: 'MEDIUM',
        frequency: 32,
        avgDelayHours: 4.2,
        department: 'Legal'
      },
      {
        id: 'reason-003',
        category: 'Technical Issues',
        reason: 'System Downtime',
        description: 'IT systems unavailable for processing',
        impact: 'CRITICAL',
        frequency: 12,
        avgDelayHours: 12.0,
        department: 'IT'
      },
      {
        id: 'reason-004',
        category: 'External Dependencies',
        reason: 'Vendor Response Delay',
        description: 'Third-party vendor delayed in providing required information',
        impact: 'MEDIUM',
        frequency: 28,
        avgDelayHours: 6.8,
        department: 'Procurement'
      },
      {
        id: 'reason-005',
        category: 'Documentation Issues',
        reason: 'Incomplete Documentation',
        description: 'Required documents missing or incomplete',
        impact: 'LOW',
        frequency: 67,
        avgDelayHours: 2.1,
        department: 'All'
      }
    ]);

    // Mock shadow delays data
    setShadowDelays([
      {
        id: 'shadow-001',
        requestId: 'req-001',
        requestTitle: 'Budget Approval Request',
        actualDelay: 48,
        reportedDelay: 24,
        shadowHours: 24,
        detectedAt: '2024-01-12T09:00:00Z',
        reportedBy: 'john.doe',
        verifiedBy: 'auditor',
        status: 'VERIFIED',
        department: 'Finance'
      },
      {
        id: 'shadow-002',
        requestId: 'req-002',
        requestTitle: 'Contract Renewal',
        actualDelay: 72,
        reportedDelay: 48,
        shadowHours: 24,
        detectedAt: '2024-01-11T14:30:00Z',
        reportedBy: 'jane.smith',
        verifiedBy: 'auditor',
        status: 'DISPUTED',
        department: 'Legal'
      },
      {
        id: 'shadow-003',
        requestId: 'req-003',
        requestTitle: 'Infrastructure Upgrade',
        actualDelay: 36,
        reportedDelay: 12,
        shadowHours: 24,
        detectedAt: '2024-01-10T16:45:00Z',
        reportedBy: 'mike.wilson',
        status: 'PENDING',
        department: 'IT'
      }
    ]);

    // Mock delay debt data
    setDelayDebt([
      {
        userId: 'user-001',
        username: 'john.doe',
        role: 'CLERK',
        department: 'Finance',
        totalDebtHours: 156,
        currentMonthDebt: 24,
        lastMonthDebt: 18,
        trend: 'DECLINING',
        repeatOffender: true,
        topDelayReason: 'Staff Shortage'
      },
      {
        userId: 'user-002',
        username: 'jane.smith',
        role: 'SECTION_OFFICER',
        department: 'Legal',
        totalDebtHours: 89,
        currentMonthDebt: 12,
        lastMonthDebt: 15,
        trend: 'IMPROVING',
        repeatOffender: false,
        topDelayReason: 'Complex Approval Required'
      },
      {
        userId: 'user-003',
        username: 'mike.wilson',
        role: 'HOD',
        department: 'IT',
        totalDebtHours: 234,
        currentMonthDebt: 48,
        lastMonthDebt: 36,
        trend: 'STABLE',
        repeatOffender: true,
        topDelayReason: 'System Downtime'
      }
    ]);

    // Mock metrics
    setMetrics({
      totalDelays: 284,
      shadowDelays: 47,
      avgDelayTime: 6.8,
      delayDebtTotal: 1247,
      repeatDelayRate: 23.4,
      topDelayingDepartment: 'Finance',
      mostCommonReason: 'Incomplete Documentation',
      accountabilityScore: 76.3
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const canManageDebt = user?.role && ['ADMIN', 'HOD'].includes(user.role);

  const filteredReasons = delayReasons.filter((reason: DelayReason) => {
    const matchesSearch = searchTerm === '' || 
      reason.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || reason.category === filterCategory;
    const matchesDepartment = filterDepartment === 'all' || reason.department === filterDepartment;
    
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DISPUTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'DECLINING': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'STABLE': return <Activity className="w-4 h-4 text-amber-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-body text-slate-600">Loading accountability system...</p>
        </div>
      </div>
    );
  }

  if (!featureFlags?.advancedAccountability) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-subheading text-slate-900 mb-2">Feature Not Available</h3>
          <p className="text-body text-slate-600 mb-6">
            Advanced accountability features are currently disabled.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <Shield className="w-8 h-8 text-slate-700 mr-3" />
                <h1 className="text-xl font-bold text-slate-900">HDAS</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <button className="nav-link">Dashboard</button>
                <button className="nav-link">Requests</button>
                <button className="nav-link">Processes</button>
                <button className="nav-link-active">Accountability</button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                <p className="text-caption text-slate-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Advanced Accountability</h2>
            <p className="page-description">
              Delay analysis, shadow delays, and debt tracking
            </p>
          </div>
          {canManageDebt && (
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
        </div>

        {/* Accountability Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-8 gap-6 mb-8">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.totalDelays}</div>
              <div className="kpi-card-title">Total Delays</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.shadowDelays}</div>
              <div className="kpi-card-title">Shadow Delays</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Timer className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.avgDelayTime}h</div>
              <div className="kpi-card-title">Avg Delay</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.delayDebtTotal}</div>
              <div className="kpi-card-title">Delay Debt</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.repeatDelayRate}%</div>
              <div className="kpi-card-title">Repeat Rate</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.topDelayingDepartment}</div>
              <div className="kpi-card-title">Top Dept</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.mostCommonReason}</div>
              <div className="kpi-card-title">Top Reason</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.accountabilityScore}%</div>
              <div className="kpi-card-title">Accountability Score</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="surface-card-elevated p-2 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('reasons')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reasons'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Delay Reasons
            </button>
            <button
              onClick={() => setActiveTab('shadow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'shadow'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Shadow Delays
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'debt'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Delay Debt
            </button>
          </div>
        </div>

        {/* Delay Reasons Tab */}
        {activeTab === 'reasons' && (
          <div className="surface-card-elevated p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-subheading text-slate-900">Delay Reason Analysis</h3>
              <div className="flex items-center space-x-2 text-caption text-slate-500">
                <FileText className="w-3 h-3" />
                <span>Predefined taxonomy for delay categorization</span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search delay reasons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Categories</option>
                  <option value="Resource Unavailability">Resource Unavailability</option>
                  <option value="Process Issues">Process Issues</option>
                  <option value="Technical Issues">Technical Issues</option>
                  <option value="External Dependencies">External Dependencies</option>
                  <option value="Documentation Issues">Documentation Issues</option>
                </select>
              </div>
              <div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="form-input"
                >
                  <option value="all">All Departments</option>
                  <option value="Finance">Finance</option>
                  <option value="Legal">Legal</option>
                  <option value="IT">IT</option>
                  <option value="Procurement">Procurement</option>
                </select>
              </div>
            </div>

            {/* Delay Reasons Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Impact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg Delay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredReasons.map((reason) => (
                    <tr key={reason.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{reason.category}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">{reason.reason}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600">{reason.description}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getImpactColor(reason.impact)}`}>
                          {reason.impact}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {reason.frequency}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {reason.avgDelayHours}h
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {reason.department}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReasons.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-subheading text-slate-900 mb-2">No delay reasons found</h3>
                <p className="text-body text-slate-600">
                  No delay reasons match your current filters.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Shadow Delays Tab */}
        {activeTab === 'shadow' && (
          <div className="surface-card-elevated p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-subheading text-slate-900">Shadow Delay Detection</h3>
              <div className="flex items-center space-x-2 text-caption text-slate-500">
                <Zap className="w-3 h-3" />
                <span>Discrepancies between reported and actual delays</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Reported Delay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actual Delay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Shadow Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {shadowDelays.map((shadow) => (
                    <tr key={shadow.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{shadow.requestTitle}</p>
                          <p className="text-xs text-slate-500">{shadow.requestId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {shadow.reportedDelay}h
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {shadow.actualDelay}h
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-purple-900">{shadow.shadowHours}h</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(shadow.status)}`}>
                          {shadow.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setShowDetails(shadow)}
                          className="btn-ghost"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delay Debt Tab */}
        {activeTab === 'debt' && (
          <div className="surface-card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-subheading text-slate-900">Delay Debt Tracking</h3>
              <div className="flex items-center space-x-2 text-caption text-slate-500">
                <Target className="w-3 h-3" />
                <span>Cumulative delay accountability per user</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {delayDebt.map((debt) => (
                <div key={debt.userId} className="p-6 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-subheading text-slate-900">{debt.username}</h4>
                      <p className="text-caption text-slate-500">{debt.role} • {debt.department}</p>
                    </div>
                    <div className="flex items-center">
                      {debt.repeatOffender && (
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      {getTrendIcon(debt.trend)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-caption text-slate-500">Total Debt</span>
                      <span className="text-subheading text-slate-900">{debt.totalDebtHours}h</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-caption text-slate-500">This Month</span>
                      <div className="flex items-center">
                        <ArrowUp className="w-3 h-3 text-red-500 mr-1" />
                        <span className="text-sm text-slate-900">{debt.currentMonthDebt}h</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-caption text-slate-500">Last Month</span>
                      <span className="text-sm text-slate-600">{debt.lastMonthDebt}h</span>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-caption text-slate-500">Top Reason</span>
                        <span className="text-sm text-slate-900">{debt.topDelayReason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {activeTab === 'shadow' ? 'Shadow Delay Details' : 'Delay Reason Details'}
                </h3>
                <p className="text-body text-slate-600">
                  {activeTab === 'shadow' 
                    ? 'Complete analysis of shadow delay discrepancy'
                    : 'Detailed delay reason information'
                  }
                </p>
              </div>
              <button 
                onClick={() => setShowDetails(null)}
                className="btn-ghost"
              >
                ×
              </button>
            </div>

            {activeTab === 'shadow' && showDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Request ID</p>
                    <p className="text-subheading text-slate-900">{showDetails.requestId}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Request Title</p>
                    <p className="text-subheading text-slate-900">{showDetails.requestTitle}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Reported Delay</p>
                    <p className="text-subheading text-slate-900">{showDetails.reportedDelay}h</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Actual Delay</p>
                    <p className="text-subheading text-slate-900">{showDetails.actualDelay}h</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-900">Shadow Hours Detected</p>
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{showDetails.shadowHours}h</p>
                  <p className="text-sm text-purple-700 mt-2">
                    Discrepancy between reported and actual delay time
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Reported By</p>
                    <p className="text-subheading text-slate-900">{showDetails.reportedBy}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-caption text-slate-500 mb-1">Verified By</p>
                    <p className="text-subheading text-slate-900">{showDetails.verifiedBy || 'Pending'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetails(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
