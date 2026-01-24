'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye,
  TrendingUp,
  Clock,
  Users,
  Shield,
  LogOut,
  Search,
  Filter,
  BarChart3,
  Target,
  Activity,
  FileText,
  Download,
  Globe,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  Building,
  MapPin,
  Timer,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalRequests: number;
  avgProcessingTime: number;
  onTimeDelivery: number;
  delayedRequests: number;
  escalationRate: number;
  complianceScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

interface ProcessStats {
  processId: string;
  processName: string;
  totalRequests: number;
  avgDelayHours: number;
  bottleneckSteps: string[];
  efficiency: number;
  monthlyTrend: number[];
}

interface TransparencyMetrics {
  totalRequestsProcessed: number;
  avgProcessingTime: number;
  overallCompliance: number;
  citizenSatisfaction: number;
  systemUptime: number;
  dataAccuracy: number;
  lastUpdated: string;
}

interface PublicReport {
  id: string;
  title: string;
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  period: string;
  downloadUrl: string;
  fileSize: string;
  generatedAt: string;
}

export default function TransparencyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [processStats, setProcessStats] = useState<ProcessStats[]>([]);
  const [metrics, setMetrics] = useState<TransparencyMetrics | null>(null);
  const [publicReports, setPublicReports] = useState<PublicReport[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setFeatureFlags({
      escalation: true,
      auditCompliance: true,
      advancedAccountability: true,
      governanceAnalysis: true,
      transparency: true
    });

    // Mock department statistics (anonymized)
    setDepartmentStats([
      {
        departmentId: 'dept-001',
        departmentName: 'Finance Department',
        totalRequests: 1247,
        avgProcessingTime: 4.2,
        onTimeDelivery: 87.3,
        delayedRequests: 158,
        escalationRate: 12.7,
        complianceScore: 85.6,
        trend: 'IMPROVING'
      },
      {
        departmentId: 'dept-002',
        departmentName: 'Legal Department',
        totalRequests: 892,
        avgProcessingTime: 6.8,
        onTimeDelivery: 78.9,
        delayedRequests: 188,
        escalationRate: 21.1,
        complianceScore: 76.2,
        trend: 'STABLE'
      },
      {
        departmentId: 'dept-003',
        departmentName: 'IT Department',
        totalRequests: 634,
        avgProcessingTime: 3.5,
        onTimeDelivery: 91.2,
        delayedRequests: 56,
        escalationRate: 8.8,
        complianceScore: 89.4,
        trend: 'IMPROVING'
      },
      {
        departmentId: 'dept-004',
        departmentName: 'Procurement Department',
        totalRequests: 445,
        avgProcessingTime: 5.9,
        onTimeDelivery: 82.4,
        delayedRequests: 78,
        escalationRate: 17.5,
        complianceScore: 81.1,
        trend: 'DECLINING'
      },
      {
        departmentId: 'dept-005',
        departmentName: 'Administrative Services',
        totalRequests: 1523,
        avgProcessingTime: 2.8,
        onTimeDelivery: 94.1,
        delayedRequests: 90,
        escalationRate: 5.9,
        complianceScore: 92.3,
        trend: 'IMPROVING'
      }
    ]);

    // Mock process statistics (anonymized)
    setProcessStats([
      {
        processId: 'proc-001',
        processName: 'Budget Approval Process',
        totalRequests: 856,
        avgDelayHours: 4.5,
        bottleneckSteps: ['Financial Review', 'Manager Approval'],
        efficiency: 78.4,
        monthlyTrend: [72, 75, 78, 82, 85, 81]
      },
      {
        processId: 'proc-002',
        processName: 'Contract Renewal Process',
        totalRequests: 234,
        avgDelayHours: 7.2,
        bottleneckSteps: ['Legal Verification', 'Compliance Check'],
        efficiency: 65.8,
        monthlyTrend: [68, 64, 62, 66, 63, 65]
      },
      {
        processId: 'proc-003',
        processName: 'Infrastructure Request Process',
        totalRequests: 189,
        avgDelayHours: 3.8,
        bottleneckSteps: ['Technical Assessment'],
        efficiency: 84.2,
        monthlyTrend: [80, 82, 85, 83, 86, 88]
      },
      {
        processId: 'proc-004',
        processName: 'Vendor Onboarding Process',
        totalRequests: 167,
        avgDelayHours: 5.6,
        bottleneckSteps: ['Background Check', 'Security Clearance'],
        efficiency: 71.3,
        monthlyTrend: [70, 68, 72, 69, 67, 66]
      }
    ]);

    // Mock transparency metrics
    setMetrics({
      totalRequestsProcessed: 4741,
      avgProcessingTime: 4.6,
      overallCompliance: 84.9,
      citizenSatisfaction: 87.2,
      systemUptime: 99.7,
      dataAccuracy: 99.2,
      lastUpdated: '2024-01-12T16:30:00Z'
    });

    // Mock public reports
    setPublicReports([
      {
        id: 'report-001',
        title: 'Monthly Performance Report - December 2024',
        type: 'MONTHLY',
        period: 'December 2024',
        downloadUrl: '/api/public/reports/monthly-dec-2024.pdf',
        fileSize: '2.4 MB',
        generatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: 'report-002',
        title: 'Quarterly Transparency Report - Q4 2024',
        type: 'QUARTERLY',
        period: 'October - December 2024',
        downloadUrl: '/api/public/reports/quarterly-q4-2024.pdf',
        fileSize: '8.7 MB',
        generatedAt: '2024-01-05T14:30:00Z'
      },
      {
        id: 'report-003',
        title: 'Annual Accountability Report 2024',
        type: 'ANNUAL',
        period: 'January - December 2024',
        downloadUrl: '/api/public/reports/annual-2024.pdf',
        fileSize: '15.3 MB',
        generatedAt: '2024-01-10T11:15:00Z'
      }
    ]);
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'DECLINING': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'STABLE': return <Activity className="w-4 h-4 text-amber-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getComplianceBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-amber-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-body text-slate-600">Loading transparency portal...</p>
        </div>
      </div>
    );
  }

  if (!featureFlags?.transparency) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-subheading text-slate-900 mb-2">Feature Not Available</h3>
          <p className="text-body text-slate-600 mb-6">
            Transparency portal features are currently disabled.
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
                <button className="nav-link-active">Transparency</button>
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
            <h2 className="page-title">Transparency Portal</h2>
            <p className="page-description">
              Public access to anonymized government performance data
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-slate-600" />
            <span className="text-caption text-slate-500">Public Access</span>
          </div>
        </div>

        {/* Transparency Notice */}
        <div className="surface-card-elevated p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-subheading text-blue-900 mb-2">Public Transparency Information</h3>
              <p className="text-body text-blue-800">
                This portal provides anonymized performance data in accordance with government transparency regulations. 
                All personal identifiers have been removed to protect individual privacy while maintaining accountability.
                Data is updated daily and reflects actual system performance metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Overall Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.totalRequestsProcessed.toLocaleString()}</div>
              <div className="kpi-card-title">Total Requests</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.avgProcessingTime}h</div>
              <div className="kpi-card-title">Avg Processing</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.overallCompliance}%</div>
              <div className="kpi-card-title">Compliance Rate</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.citizenSatisfaction}%</div>
              <div className="kpi-card-title">Satisfaction</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.systemUptime}%</div>
              <div className="kpi-card-title">System Uptime</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-header">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-slate-600" />
                </div>
              </div>
              <div className="kpi-card-value">{metrics.dataAccuracy}%</div>
              <div className="kpi-card-title">Data Accuracy</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="surface-card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subheading text-slate-900">Performance Filters</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="form-input text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="form-input text-sm"
              >
                <option value="all">All Departments</option>
                <option value="dept-001">Finance Department</option>
                <option value="dept-002">Legal Department</option>
                <option value="dept-003">IT Department</option>
                <option value="dept-004">Procurement Department</option>
                <option value="dept-005">Administrative Services</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="surface-card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-subheading text-slate-900">Department Performance</h3>
            <div className="flex items-center space-x-2 text-caption text-slate-500">
              <Building className="w-3 h-3" />
              <span>Anonymized department-level metrics</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentStats.map((dept) => (
              <div key={dept.departmentId} className="p-6 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-subheading text-slate-900">{dept.departmentName}</h4>
                  <div className="flex items-center">
                    {getTrendIcon(dept.trend)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-slate-500">Total Requests</span>
                    <span className="text-subheading text-slate-900">{dept.totalRequests.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-slate-500">Avg Processing</span>
                    <span className="text-subheading text-slate-900">{dept.avgProcessingTime}h</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-slate-500">On-Time Delivery</span>
                    <div className="flex items-center">
                      <span className="text-subheading text-slate-900 mr-2">{dept.onTimeDelivery}%</span>
                      <div className={`w-2 h-2 rounded-full ${getComplianceColor(dept.onTimeDelivery)}`} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-slate-500">Escalation Rate</span>
                    <span className="text-subheading text-slate-900">{dept.escalationRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-slate-500">Compliance Score</span>
                    <div className="flex items-center">
                      <span className="text-subheading text-slate-900 mr-2">{dept.complianceScore}</span>
                      <div className={`px-2 py-1 text-xs font-medium rounded-lg ${getComplianceBgColor(dept.complianceScore)} ${getComplianceColor(dept.complianceScore)}`}>
                        {dept.complianceScore >= 90 ? 'Excellent' : dept.complianceScore >= 80 ? 'Good' : dept.complianceScore >= 70 ? 'Fair' : 'Poor'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Efficiency */}
        <div className="surface-card-elevated p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-subheading text-slate-900">Process Efficiency Analysis</h3>
            <div className="flex items-center space-x-2 text-caption text-slate-500">
              <BarChart3 className="w-3 h-3" />
              <span>Anonymized process performance data</span>
            </div>
          </div>

          <div className="space-y-4">
            {processStats.map((process) => (
              <div key={process.processId} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-subheading text-slate-900 mb-3">{process.processName}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-caption text-slate-500">Total Requests</p>
                        <p className="text-subheading text-slate-900">{process.totalRequests}</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">Avg Delay</p>
                        <p className="text-subheading text-slate-900">{process.avgDelayHours}h</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">Efficiency</p>
                        <p className="text-subheading text-slate-900">{process.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">Trend</p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(process.monthlyTrend[process.monthlyTrend.length - 1] > process.monthlyTrend[0] ? 'IMPROVING' : 
                                   process.monthlyTrend[process.monthlyTrend.length - 1] < process.monthlyTrend[0] ? 'DECLINING' : 'STABLE')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-caption text-slate-500 mb-2">Identified Bottlenecks</p>
                      <div className="flex flex-wrap gap-2">
                        {process.bottleneckSteps.map((step, index) => (
                          <span key={index} className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 border-red-200">
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Reports */}
        <div className="surface-card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-subheading text-slate-900">Public Reports</h3>
            <div className="flex items-center space-x-2 text-caption text-slate-500">
              <Download className="w-3 h-3" />
              <span>Download anonymized performance reports</span>
            </div>
          </div>

          <div className="space-y-4">
            {publicReports.map((report) => (
              <div key={report.id} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-subheading text-slate-900 mb-2">{report.title}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-caption text-slate-500">Period</p>
                        <p className="text-sm text-slate-900">{report.period}</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">Type</p>
                        <p className="text-sm text-slate-900">{report.type}</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">File Size</p>
                        <p className="text-sm text-slate-900">{report.fileSize}</p>
                      </div>
                      <div>
                        <p className="text-caption text-slate-500">Generated</p>
                        <p className="text-sm text-slate-900">
                          {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Disclaimer */}
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-subheading text-amber-900 mb-2">Data Privacy & Anonymization</h3>
              <p className="text-body text-amber-800">
                All data displayed in this transparency portal has been anonymized in accordance with privacy regulations. 
                No personal information, individual identifiers, or sensitive details are included. 
                Aggregated statistics are updated daily and represent system-wide performance metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {metrics && (
          <div className="text-center mt-6">
            <p className="text-caption text-slate-500">
              Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
