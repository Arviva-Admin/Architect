import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const autonomyLevels = [
  { level: 'A0', name: 'Manual Control', color: 'red', description: 'Manual approval for every action' },
  { level: 'A1', name: 'Supervised', color: 'orange', description: 'Execute with confirmation' },
  { level: 'A2', name: 'Monitored', color: 'yellow', description: 'Execute with post-notification' },
  { level: 'A3', name: 'Autonomous', color: 'green', description: 'Fully autonomous with reports' },
  { level: 'A4', name: 'Full Autonomy', color: 'cyan', description: 'Complete autonomy + rollback' },
];

const AutonomyPanel = () => {
  const [currentLevel, setCurrentLevel] = useState('A2');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentLevel();
  }, []);

  const fetchCurrentLevel = async () => {
    try {
      const response = await axios.get(`${API}/control-kernel/status`);
      setCurrentLevel(response.data.autonomy_level);
    } catch (error) {
      console.error('Failed to fetch autonomy level:', error);
    }
  };

  const updateAutonomyLevel = async (level) => {
    setUpdating(true);
    try {
      await axios.post(`${API}/control-kernel/autonomy-level`, { level });
      setCurrentLevel(level);
      toast.success(`Autonomy level updated to ${level}`);
    } catch (error) {
      console.error('Failed to update autonomy level:', error);
      toast.error('Failed to update autonomy level');
    } finally {
      setUpdating(false);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      red: 'border-red-500 text-red-400',
      orange: 'border-orange-500 text-orange-400',
      yellow: 'border-amber-500 text-amber-400',
      green: 'border-green-500 text-green-400',
      cyan: 'border-cyan-500 text-cyan-400',
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="glass rounded-sm p-6" data-testid="autonomy-panel">
      <div className="flex items-center gap-3 mb-4">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-tight">AUTONOMY CONTROL</h2>
      </div>

      <div className="space-y-3">
        {autonomyLevels.map((item) => (
          <button
            key={item.level}
            onClick={() => updateAutonomyLevel(item.level)}
            disabled={updating}
            className={`w-full text-left p-4 rounded border-2 transition-all ${
              currentLevel === item.level
                ? `${getColorClass(item.color)} bg-black/40`
                : 'border-gray-700 hover:border-gray-600 bg-black/20'
            } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            data-testid={`autonomy-level-${item.level}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="code-font text-xl font-bold">{item.level}</span>
                {currentLevel === item.level && (
                  <span className="status-active"></span>
                )}
              </div>
              <span className="text-sm font-bold uppercase">{item.name}</span>
            </div>
            <p className="text-xs text-gray-400">{item.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-black/30 rounded">
        <div className="text-xs text-gray-400 mb-1 uppercase">Current Level</div>
        <div className="code-font text-2xl font-bold text-cyan-400">{currentLevel}</div>
      </div>
    </div>
  );
};

export default AutonomyPanel;
