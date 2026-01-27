'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Bell, ChevronDown, Play, FileText, Calendar, Clock, Loader2, Gauge, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircularMetricCard } from '@/components/dashboard/CircularMetricCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const { isConnected } = useAppStore();
  const [dateFilter, setDateFilter] = useState('today');
  const [lastScanTime, setLastScanTime] = useState('Not executed today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real data from Snowflake APIs
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityStatus, setQualityStatus] = useState('Unknown');
  const [activeChecks, setActiveChecks] = useState(0);
  const [passedToday, setPassedToday] = useState(0);
  const [failedToday, setFailedToday] = useState(0);
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [coverageStrength, setCoverageStrength] = useState('Unknown');
  const [openAnomalies, setOpenAnomalies] = useState(0);
  const [slaBreaches, setSlaBreaches] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [attentionItems, setAttentionItems] = useState<Array<{ severity: string; message: string; icon: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update date on mount and every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data from Snowflake APIs
  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all metrics in parallel
        const [scoreRes, checksRes, failedRes, slaRes, anomaliesRes] = await Promise.all([
          fetch('/api/dq/overall-score'),
          fetch('/api/dq/total-checks'),
          fetch('/api/dq/failed-checks'),
          fetch('/api/dq/sla-compliance'),
          fetch('/api/dq/critical-failed-records'),
        ]);

        const [scoreData, checksData, failedData, slaData, anomaliesData] = await Promise.all([
          scoreRes.json(),
          checksRes.json(),
          failedRes.json(),
          slaRes.json(),
          anomaliesRes.json(),
        ]);

        // Update Quality Score
        if (scoreData.success && scoreData.data) {
          let score = scoreData.data.overallScore;
          if (score > 0 && score <= 1) score = score * 100;
          setQualityScore(Math.round(score));

          // Determine status
          if (score >= 90) setQualityStatus('Excellent');
          else if (score >= 75) setQualityStatus('Good');
          else if (score >= 60) setQualityStatus('Fair');
          else setQualityStatus('Poor');
        }

        // Update Total Checks and Last Scan Time
        if (checksData.success && checksData.data) {
          setActiveChecks(checksData.data.totalChecks || 0);

          if (checksData.data.lastExecution) {
            try {
              const lastRun = new Date(checksData.data.lastExecution);
              setLastScanTime(`Today at ${format(lastRun, 'HH:mm')} IST`);
            } catch (e) {
              setLastScanTime('Unknown');
            }
          } else {
            setLastScanTime('Not executed today');
          }
        }

        // Update Failed Checks
        if (failedData.success && failedData.data) {
          const failed = failedData.data.totalFailedChecks || 0;
          setFailedToday(failed);
          const total = checksData.data?.totalChecks || 0;
          const passed = total - failed;
          setPassedToday(passed);

          // Calculate coverage
          if (total > 0) {
            const coverage = ((passed / total) * 100);
            setCoveragePercent(Math.round(coverage * 10) / 10);

            if (coverage >= 90) setCoverageStrength('Strong');
            else if (coverage >= 75) setCoverageStrength('Moderate');
            else setCoverageStrength('Weak');
          }
        }

        // Update SLA Compliance
        if (slaData.success && slaData.data) {
          const slaCompliance = slaData.data.slaCompliancePct || 100;
          if (slaCompliance < 100) {
            setSlaBreaches(Math.round((100 - slaCompliance) / 10)); // Estimate breaches
          }
        }

        // Update Anomalies
        if (anomaliesData.success && anomaliesData.data) {
          const anomalies = anomaliesData.data.criticalFailedRecords || 0;
          setOpenAnomalies(anomalies);

          // Determine risk level
          if (anomalies > 10 || (slaData.data?.slaCompliancePct || 100) < 80) {
            setRiskLevel('High');
          } else if (anomalies > 5 || (slaData.data?.slaCompliancePct || 100) < 90) {
            setRiskLevel('Medium');
          } else {
            setRiskLevel('Low');
          }
        }

        // Build attention items from real data
        const items = [];
        if (failedData.success && failedData.data && failedData.data.totalFailedChecks > 0) {
          items.push({
            severity: 'critical',
            message: `${failedData.data.totalFailedChecks} checks failing across datasets`,
            icon: '🔴'
          });
        }
        if (slaData.success && slaData.data && slaData.data.slaCompliancePct < 100) {
          items.push({
            severity: 'warning',
            message: `SLA compliance at ${Math.round(slaData.data.slaCompliancePct)}%`,
            icon: '🟠'
          });
        }
        if (anomaliesData.success && anomaliesData.data && anomaliesData.data.criticalFailedRecords > 0) {
          items.push({
            severity: 'info',
            message: `${anomaliesData.data.criticalFailedRecords} critical records need attention`,
            icon: '🔵'
          });
        }
        setAttentionItems(items);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected, refreshKey]);

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/dq/run-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanType: 'full' }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh metrics after scan
        window.location.reload();
      } else {
        alert('Scan failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error running scan:', error);
      alert('Failed to run scan');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Navigation */}
      <TopNav />

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Quality — Today</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {format(currentDate, 'EEEE, d MMMM yyyy')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Overall data quality health across all monitored datasets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium bg-white">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Today
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Clock className="h-4 w-4" />
                  Last Scan: {lastScanTime}
                </div>

                <Button
                  onClick={handleRunScan}
                  disabled={isScanning || !isConnected}
                  className={`${isScanning ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-white hover:bg-gray-800'} flex items-center gap-2 transition-all`}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Scan Now
                    </>
                  )}
                </Button>

                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Reports
                </Button>
              </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Card 1: Overall Quality Health */}
              <CircularMetricCard
                title="Overall Quality Score"
                value={qualityScore}
                total={activeChecks}
                icon={Gauge}
                color="green"
                trend={{ value: 2.1, label: 'vs last week', isPositive: true }}
              />

              {/* Card 2: Coverage & Completeness */}
              <CircularMetricCard
                title="Coverage Score"
                value={coveragePercent}
                total={activeChecks}
                icon={ShieldCheck}
                color="blue"
                trend={{ value: 5.4, label: 'vs last week', isPositive: true }}
              />

              {/* Card 3: Risk & Validity */}
              <CircularMetricCard
                title="Validity Score"
                value={Math.round(100 - (failedToday / (passedToday + failedToday || 1)) * 100) || 0}
                total={failedToday}
                icon={AlertTriangle}
                color="amber"
                trend={{ value: 1.2, label: 'vs last week', isPositive: false }}
              />
            </div>

            {/* What Needs Attention */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">What Needs Attention Today</h2>
                  <Link href="/issues" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all issues →
                  </Link>
                </div>
                <div className="space-y-3">
                  {attentionItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{item.message}</span>
                      </div>
                      <ChevronDown className="h-5 w-5 text-gray-400 -rotate-90" />
                    </button>
                  ))}
                  {attentionItems.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No critical issues found. Great job!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

