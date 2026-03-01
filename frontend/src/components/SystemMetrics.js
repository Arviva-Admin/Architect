import React from 'react';
import { Activity, Clock, Cpu, HardDrive } from 'lucide-react';

const SystemMetrics = ({ systemState }) => {
  const { cognitiveEngine, controlKernel } = systemState;

  return (
    <div className="glass rounded-sm p-6" data-testid="system-metrics">
      <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-tight">SYSTEM METRICS</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Response Time */}
        <div className="bg-black/30 rounded p-4" data-testid="metric-response-time">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400 uppercase">Response Time</span>
          </div>
          <div className="code-font text-2xl text-cyan-400 font-bold">
            {cognitiveEngine?.avg_response_time_ms?.toFixed(0) || '0'}
            <span className="text-sm text-gray-400 ml-1">ms</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: &lt;2000ms
          </div>
        </div>

        {/* Total Queries */}
        <div className="bg-black/30 rounded p-4" data-testid="metric-queries">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400 uppercase">Total Queries</span>
          </div>
          <div className="code-font text-2xl text-green-400 font-bold">
            {cognitiveEngine?.performance_metrics?.total_queries || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Success: {cognitiveEngine?.performance_metrics?.successful_queries || 0}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-black/30 rounded p-4" data-testid="metric-memory">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400 uppercase">Memory</span>
          </div>
          <div className="code-font text-2xl text-amber-400 font-bold">
            12.5
            <span className="text-sm text-gray-400 ml-1">GB</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max: 35GB
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-black/30 rounded p-4" data-testid="metric-cpu">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400 uppercase">CPU</span>
          </div>
          <div className="code-font text-2xl text-purple-400 font-bold">
            45
            <span className="text-sm text-gray-400 ml-1">%</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Max: 80%
          </div>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase">SLA Compliance</span>
          <span className="text-xs code-font text-green-400">
            {cognitiveEngine?.meets_sla ? 'MEETING SLA' : 'BELOW SLA'}
          </span>
        </div>
        <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-cyan-500"
            style={{ width: cognitiveEngine?.meets_sla ? '100%' : '50%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
