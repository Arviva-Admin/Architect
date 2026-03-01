import React from 'react';
import { Shield, Brain } from 'lucide-react';

const DualCoreStatus = ({ systemState }) => {
  const { controlKernel, cognitiveEngine } = systemState;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="dual-core-status">
      {/* Control Kernel */}
      <div className="glass rounded-sm p-6 border-l-4 border-red-500 card-hover" data-testid="control-kernel-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center glow-red">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400 tracking-tight">CONTROL KERNEL</h2>
              <p className="text-xs text-gray-400 uppercase">Immutable</p>
            </div>
          </div>
          <span className="status-active"></span>
        </div>

        {controlKernel && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Version</div>
                <div className="code-font text-white">{controlKernel.version}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
                <div className="code-font text-red-400">{controlKernel.status}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Autonomy Level</div>
              <div className="code-font text-2xl text-red-400 font-bold">
                {controlKernel.autonomy_level}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Execution Log Size</div>
              <div className="code-font text-white">{controlKernel.execution_log_size || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Cognitive Engine */}
      <div className="glass rounded-sm p-6 border-l-4 border-cyan-500 card-hover" data-testid="cognitive-engine-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center glow-cyan">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cyan-400 tracking-tight">COGNITIVE ENGINE</h2>
              <p className="text-xs text-gray-400 uppercase">Evolvable</p>
            </div>
          </div>
          <span className="status-active"></span>
        </div>

        {cognitiveEngine && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Version</div>
                <div className="code-font text-white">{cognitiveEngine.version}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">Status</div>
                <div className="code-font text-cyan-400">{cognitiveEngine.status}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Avg Response Time</div>
              <div className="flex items-baseline gap-2">
                <div className="code-font text-2xl text-cyan-400 font-bold">
                  {cognitiveEngine.avg_response_time_ms?.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-400">ms</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase mb-1">Meets SLA (&lt;2s)</div>
              <div className="code-font text-white">
                {cognitiveEngine.meets_sla ? '✓ YES' : '✗ NO'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualCoreStatus;
