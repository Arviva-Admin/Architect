import React, { useState } from 'react';
import axios from 'axios';
import { Play, RotateCcw, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuickActions = () => {
  const [loading, setLoading] = useState({});

  const handleAction = async (action, endpoint, payload = {}) => {
    setLoading({ ...loading, [action]: true });
    try {
      const response = await axios.post(`${API}${endpoint}`, payload);
      toast.success(`${action} completed successfully`);
      console.log(response.data);
    } catch (error) {
      console.error(`${action} failed:`, error);
      toast.error(`${action} failed`);
    } finally {
      setLoading({ ...loading, [action]: false });
    }
  };

  const actions = [
    {
      id: 'create-snapshot',
      icon: Save,
      label: 'Create Snapshot',
      description: 'Save current system state',
      color: 'green',
      onClick: () => handleAction('Create Snapshot', '/rollback/snapshot', {
        description: 'Manual snapshot from dashboard',
        tags: ['manual', 'dashboard']
      })
    },
    {
      id: 'run-simulation',
      icon: TestTube,
      label: 'Run Simulation',
      description: 'Test operation in shadow world',
      color: 'amber',
      onClick: () => {
        handleAction('Create Simulation', '/shadow-world/simulation', {
          operation: {
            type: 'optimization',
            scope: 'local',
            description: 'Test optimization'
          }
        }).then(async (result) => {
          if (result?.simulation_id) {
            await handleAction('Run Simulation', `/shadow-world/simulation/${result.simulation_id}/run`);
          }
        });
      }
    },
    {
      id: 'trigger-reasoning',
      icon: Play,
      label: 'Trigger Reasoning',
      description: 'Execute cognitive analysis',
      color: 'cyan',
      onClick: () => handleAction('Reasoning', '/cognitive-engine/reason', {
        type: 'project_analysis',
        data: { test: true }
      })
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'border-green-500 text-green-400 hover:bg-green-500/10',
      amber: 'border-amber-500 text-amber-400 hover:bg-amber-500/10',
      cyan: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="glass rounded-sm p-6" data-testid="quick-actions">
      <h2 className="text-lg font-bold text-white mb-4 uppercase tracking-tight">QUICK ACTIONS</h2>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={loading[action.label]}
              className={`p-4 border-2 rounded transition-all text-left ${
                getColorClasses(action.color)
              } ${loading[action.label] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              data-testid={action.id}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-bold uppercase text-sm mb-1">{action.label}</div>
                  <div className="text-xs text-gray-400">{action.description}</div>
                </div>
                {loading[action.label] && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-black/30 rounded">
        <div className="text-xs text-gray-400 uppercase mb-2">Recent Actions</div>
        <div className="space-y-1">
          <div className="text-xs code-font text-gray-500">No recent actions</div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
