import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/http';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Cloud,
  Server,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export function ApiHealthPage() {
  const navigate = useNavigate();
  const [systemHealth, setSystemHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  // Diagnostics suite state
  const [runningSuite, setRunningSuite] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchSystemHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await apiRequest('/health', { auth: false });
      setSystemHealth(data);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthError(err.message || 'Cannot reach backend server on port 8081.');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const runDiagnostics = async () => {
    setRunningSuite(true);
    const results = [];

    const endpointsToTest = [
      {
        name: 'Backend Core & Database Ping',
        path: '/health',
        method: 'GET',
        auth: false,
        category: 'System',
      },
      {
        name: 'Authentication Session Check',
        path: '/auth/me',
        method: 'GET',
        auth: true,
        category: 'Auth',
      },
      {
        name: 'My Courses & Enrolled Classes',
        path: '/courses/my',
        method: 'GET',
        auth: true,
        category: 'Courses',
      },
      {
        name: 'My Assignments with Status',
        path: '/assignments/my',
        method: 'GET',
        auth: true,
        category: 'Assignments',
      },
      {
        name: 'Student Dashboard Stats & Deadlines',
        path: '/dashboard/student',
        method: 'GET',
        auth: true,
        category: 'Dashboard',
      },
      {
        name: 'Professor Dashboard & Teaching Queue',
        path: '/dashboard/professor',
        method: 'GET',
        auth: true,
        category: 'Dashboard',
      },
      {
        name: 'Submissions Global Queue',
        path: '/submissions',
        method: 'GET',
        auth: true,
        category: 'Submissions',
      },
    ];

    for (const test of endpointsToTest) {
      const start = performance.now();
      try {
        const data = await apiRequest(test.path, {
          method: test.method,
          auth: test.auth,
        });
        const latency = Math.round(performance.now() - start);
        results.push({
          ...test,
          status: 'SUCCESS',
          httpCode: 200,
          latency,
          payload: data,
        });
      } catch (err) {
        const latency = Math.round(performance.now() - start);
        results.push({
          ...test,
          status: 'ERROR',
          httpCode: err.status || 400,
          latency,
          error: err.message || 'Request failed',
          payload: err.payload || { error: err.message },
        });
      }
    }

    setTestResults(results);
    setRunningSuite(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top bar navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-ink-border shadow-soft">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-slate-100 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-ink flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Open LMS API Health & Diagnostics
              </h1>
              <p className="text-xs text-ink-muted">
                Live inspection of backend services, MySQL database, and REST API modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSystemHealth}
              disabled={healthLoading}
            >
              Refresh Status
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Activity}
              onClick={runDiagnostics}
              disabled={runningSuite}
            >
              {runningSuite ? 'Running Diagnostics...' : 'Run API Test Suite'}
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Backend Server */}
          <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-brand-600" /> Backend Service
              </span>
              <Badge
                variant={systemHealth?.status === 'UP' ? 'success' : 'rose'}
                size="xs"
              >
                {systemHealth?.status || (healthError ? 'DOWN' : 'CHECKING')}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-black text-ink">
                {systemHealth?.status === 'UP' ? 'Online (8081)' : 'Offline'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Spring Boot REST API on port 8081
              </p>
            </div>
            {healthError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {healthError}
              </p>
            )}
          </div>

          {/* 2. Database Status */}
          <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-violet-600" /> MySQL Database
              </span>
              <Badge
                variant={systemHealth?.database?.status === 'UP' ? 'success' : 'rose'}
                size="xs"
              >
                {systemHealth?.database?.status || 'UNKNOWN'}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-black text-ink">
                {systemHealth?.database?.latencyMs !== undefined
                  ? `${systemHealth.database.latencyMs} ms`
                  : '---'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Database response latency
              </p>
            </div>
            {systemHealth?.database?.counts && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-ink-muted">
                  Users: {systemHealth.database.counts.users}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-ink-muted">
                  Courses: {systemHealth.database.counts.courses}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-ink-muted">
                  Assignments: {systemHealth.database.counts.assignments}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-ink-muted">
                  Quizzes: {systemHealth.database.counts.quizzes}
                </span>
              </div>
            )}
          </div>

          {/* 3. Cloudinary File Storage */}
          <div className="bg-white p-5 rounded-2xl border border-ink-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-600" /> Cloudinary Storage
              </span>
              <Badge
                variant={systemHealth?.fileStorage?.status === 'READY' ? 'success' : 'amber'}
                size="xs"
              >
                {systemHealth?.fileStorage?.status || 'UNCONFIGURED'}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-black text-ink">
                {systemHealth?.fileStorage?.configured ? 'Configured' : 'No Secret'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Cloud asset & submission uploader
              </p>
            </div>
            {systemHealth?.fileStorage?.cloudName && (
              <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-mono">
                Cloud: {systemHealth.fileStorage.cloudName}
              </span>
            )}
          </div>
        </div>

        {/* API Diagnostics Test Suite Section */}
        <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Live API Endpoint Diagnostic Suite
              </h2>
              <p className="text-xs text-ink-muted">
                Test each endpoint in realtime to verify JSON serialization, authentication, and database queries.
              </p>
            </div>

            {testResults.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {testResults.filter((r) => r.status === 'SUCCESS').length} Passing
                </span>
                <span>·</span>
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {testResults.filter((r) => r.status === 'ERROR').length} Failing
                </span>
              </div>
            )}
          </div>

          {testResults.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Activity className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-ink">Ready to run diagnostics</p>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Click "Run API Test Suite" above to send live probes to all backend modules.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Activity}
                onClick={runDiagnostics}
                disabled={runningSuite}
              >
                Start Diagnostic Suite
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((t, idx) => {
                const isExpanded = expandedIndex === idx;
                const isSuccess = t.status === 'SUCCESS';

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70"
                    >
                      <div className="flex items-center gap-3">
                        {isSuccess ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink">{t.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-bold">
                              {t.method} {t.path}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-muted">
                            Category: {t.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-ink-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {t.latency} ms
                        </span>
                        <Badge variant={isSuccess ? 'success' : 'rose'} size="xs">
                          HTTP {t.httpCode}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-ink-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-ink-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-slate-900 border-t border-slate-200 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64">
                        <pre>{JSON.stringify(t.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
