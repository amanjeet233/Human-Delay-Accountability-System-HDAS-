'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Shield,
  LogOut,
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Mock analytics data
    setStats({
      processWiseDelays: [
        { process: 'Document Processing', delayPercentage: 18.2, totalRequests: 452, trend: 'up' },
        { process: 'Approval Workflow', delayPercentage: 31.7, totalRequests: 298, trend: 'up' },
        { process: 'User Onboarding', delayPercentage: 12.4, totalRequests: 156, trend: 'down' },
        { process: 'IT Procurement', delayPercentage: 24.1, totalRequests: 189, trend: 'stable' },
        { process: 'Legal Review', delayPercentage: 28.9, totalRequests: 87, trend: 'up' }
      ],
      roleWiseDelays: [
        { role: 'Administrator', delayedCount: 12, totalProcessed: 145, delayRate: 8.3 },
        { role: 'Manager', delayedCount: 34, totalProcessed: 234, delayRate: 14.5 },
        { role: 'Analyst', delayedCount: 28, totalProcessed: 189, delayRate: 14.8 },
        { role: 'User', delayedCount: 45, totalProcessed: 567, delayRate: 7.9 }
      ],
      overallMetrics: {
        totalRequests: 1247,
        delayedRequests: 292,
        averageDelayTime: 2.8,
        slaBreachRate: 23.4,
        escalations: 89
      }
    });
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getDelayColor = (percentage: number) => {
    if (percentage < 15) return 'text-emerald-600 bg-emerald-50';
    if (percentage < 25) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4" />;
      case 'down': return <ArrowDownRight className="w-4 h-4" />;
      default: return <div className="w-4 h-4 bg-slate-300 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-emerald-600';
      default: return 'text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-body text-slate-600">Loading analytics...</p>
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
                <button className="nav-link">Create Request</button>
                <button className="nav-link">Timeline</button>
                <button className="nav-link-active">Analytics</button>
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
            <h2 className="page-title">Delay Analytics</h2>
            <p className="page-description">
              Process and role-wise delay analysis
            </p>
          </div>
          <button className="btn-secondary">
            <Activity className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <div className="kpi-card-value">{stats.overallMetrics.totalRequests}</div>
            <div className="kpi-card-title">Total Requests</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="kpi-card-value">{stats.overallMetrics.delayedRequests}</div>
            <div className="kpi-card-title">Delayed Requests</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="kpi-card-value">{stats.overallMetrics.averageDelayTime}d</div>
            <div className="kpi-card-title">Avg Delay Time</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="kpi-card-value">{stats.overallMetrics.slaBreachRate}%</div>
            <div className="kpi-card-title">SLA Breach Rate</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="kpi-card-value">{stats.overallMetrics.escalations}</div>
            <div className="kpi-card-title">Escalations</div>
          </div>
        </div>

        {/* Process-wise Delays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="surface-card-elevated p-6">
            <div className="section-header">
              <div>
                <h3 className="section-title">Process-wise Delays</h3>
                <p className="section-description">Delay percentage by process type</p>
              </div>
              <button className="btn-ghost">
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {stats.processWiseDelays.map((process: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{process.process}</p>
                      <p className="text-caption text-slate-500">{process.totalRequests} requests</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getDelayColor(process.delayPercentage)}`}>
                      {process.delayPercentage}%
                    </div>
                    <div className={`flex items-center ${getTrendColor(process.trend)}`}>
                      {getTrendIcon(process.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role-wise Delays */}
          <div className="surface-card-elevated p-6">
            <div className="section-header">
              <div>
                <h3 className="section-title">Role-wise Delays</h3>
                <p className="section-description">Delay count and rate by user role</p>
              </div>
              <button className="btn-ghost">
                <Users className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {stats.roleWiseDelays.map((role: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{role.role}</p>
                      <p className="text-caption text-slate-500">{role.totalProcessed} processed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{role.delayedCount}</p>
                      <p className={`text-sm font-medium ${getDelayColor(role.delayRate)}`}>
                        {role.delayRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="surface-card-elevated p-6">
          <div className="section-header">
            <div>
              <h3 className="section-title">Key Insights</h3>
              <p className="section-description">Automated analysis of delay patterns</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="text-subheading text-red-900">Critical Bottleneck</h4>
              </div>
              <p className="text-body text-red-800">
                Approval Workflow shows 31.7% delay rate, significantly above system average of 23.4%
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-amber-600 mr-2" />
                <h4 className="text-subheading text-amber-900">Trend Alert</h4>
              </div>
              <p className="text-body text-amber-800">
                3 out of 5 processes show increasing delay trends this month
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-emerald-600 mr-2" />
                <h4 className="text-subheading text-emerald-900">Performance Highlight</h4>
              </div>
              <p className="text-body text-emerald-800">
                User Onboarding improved with 12.4% delay rate, down from 18.2% last month
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
