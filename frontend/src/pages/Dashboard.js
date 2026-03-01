import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Brain, Shield, Database, GitBranch, Layers, ExternalLink } from 'lucide-react';
import { useSystemState } from '../hooks';
import DualCoreStatus from '../components/DualCoreStatus';
import SystemMetrics from '../components/SystemMetrics';
import AutonomyPanel from '../components/AutonomyPanel';
import ProjectRegistry from '../components/ProjectRegistry';
import QuickActions from '../components/QuickActions';
import VoiceInterface from '../components/VoiceInterface';
import NotificationArea from '../components/NotificationArea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { systemState, isConnected } = useSystemState();
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await axios.get(`${API}/health`);
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] scanlines">
      {/* Header */}
      <header className="border-b border-gray-800 glass">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="dashboard-title">
                AUTONOMOUS COGNITIVE CONTROL FABRIC
              </h1>
              <p className="text-sm text-gray-400 mt-1 code-font">Meta-Layer Control System v1.0.0</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2" data-testid="connection-status">
                <span className={isConnected ? 'status-active' : 'status-inactive'}></span>
                <span className="text-sm text-gray-400 code-font">
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <Link
                to="/graph"
                className="btn-tactical-primary flex items-center gap-2"
                data-testid="graph-explorer-link"
              >
                <Layers className="w-4 h-4" />
                GRAPH EXPLORER
              </Link>
              <Link
                to="/docs"
                className="btn-tactical bg-gray-700 text-white hover:bg-gray-600 flex items-center gap-2"
                data-testid="docs-link"
              >
                <ExternalLink className="w-4 h-4" />
                DOCUMENTATION
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Dual Core Status - Top Priority */}
        <div className="mb-6" data-testid="dual-core-section">
          <DualCoreStatus systemState={systemState} />
        </div>

        {/* High Density Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Autonomy Panel */}
          <div className="lg:col-span-1" data-testid="autonomy-panel-section">
            <AutonomyPanel />
          </div>

          {/* System Metrics */}
          <div className="lg:col-span-2" data-testid="system-metrics-section">
            <SystemMetrics systemState={systemState} />
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Project Registry */}
          <div data-testid="project-registry-section">
            <ProjectRegistry />
          </div>

          {/* Quick Actions */}
          <div data-testid="quick-actions-section">
            <QuickActions />
          </div>
        </div>

        {/* System Health Cards */}
        {healthStatus && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="health-status-section">
            {Object.entries(healthStatus.components || {}).map(([key, value]) => (
              <div
                key={key}
                className="glass rounded-sm p-4 card-hover"
                data-testid={`health-card-${key}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase text-gray-400 tracking-wider">{key.replace('_', ' ')}</span>
                  <span className={value === 'active' ? 'status-active' : 'status-inactive'}></span>
                </div>
                <div className="code-font text-lg text-cyan-400">{value}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-gray-800 mt-8 glass">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-gray-500 code-font">
            <div>ACCF © 2026 | Emergent Labs</div>
            <div>MAX RESOURCE USAGE: 35GB RAM | RESPONSE TIME: &lt;2s SLA</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
