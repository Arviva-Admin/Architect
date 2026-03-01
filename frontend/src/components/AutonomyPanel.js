import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const autonomyLevels = [
  { level: 'A0', name: 'Manual Control', color: 'red', value: 0, description: 'Manual approval for every action' },
  { level: 'A1', name: 'Supervised', color: 'orange', value: 25, description: 'Execute with confirmation' },
  { level: 'A2', name: 'Monitored', color: 'yellow', value: 50, description: 'Execute with post-notification' },
  { level: 'A3', name: 'Autonomous', color: 'green', value: 75, description: 'Fully autonomous with reports' },
  { level: 'A4', name: 'Full Autonomy', color: 'cyan', value: 100, description: 'Complete autonomy + rollback' },
];

const AutonomyPanel = () => {
  const [currentLevel, setCurrentLevel] = useState('A2');
  const [previousLevel, setPreviousLevel] = useState('A2');
  const [updating, setUpdating] = useState(false);
  const [history, setHistory] = useState([]);
  const [animatingTo, setAnimatingTo] = useState(null);

  useEffect(() => {
    fetchCurrentLevel();
    fetchAutonomyHistory();
  }, []);

  const fetchCurrentLevel = async () => {
    try {
      const response = await axios.get(`${API}/control-kernel/status`);
      setCurrentLevel(response.data.autonomy_level);
      setPreviousLevel(response.data.autonomy_level);
    } catch (error) {
      console.error('Failed to fetch autonomy level:', error);
    }
  };

  const fetchAutonomyHistory = async () => {
    try {
      const response = await axios.get(`${API}/control-kernel/execution-log?limit=10`);
      const autonomyChanges = response.data.log.filter(
        entry => entry.action === 'autonomy_level_change'
      );
      setHistory(autonomyChanges);
    } catch (error) {
      console.error('Failed to fetch autonomy history:', error);
    }
  };

  const updateAutonomyLevel = async (level) => {
    setPreviousLevel(currentLevel);
    setUpdating(true);
    setAnimatingTo(level);

    try {
      await axios.post(`${API}/control-kernel/autonomy-level`, { level });
      setCurrentLevel(level);
      
      toast.success(`Autonomy level updated: ${previousLevel} → ${level}`);

      // Refresh history
      fetchAutonomyHistory();
    } catch (error) {
      console.error('Failed to update autonomy level:', error);
      toast.error('Failed to update autonomy level');
    } finally {
      setUpdating(false);
      setAnimatingTo(null);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      red: { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500' },
      orange: { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500' },
      yellow: { border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500' },
      green: { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500' },
      cyan: { border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500' },
    };
    return colors[color] || colors.cyan;
  };

  const getCurrentValue = () => {
    const current = autonomyLevels.find(l => l.level === currentLevel);
    return current ? current.value : 50;
  };

  return (
    <div className="glass rounded-sm p-6" data-testid="enhanced-autonomy-panel">
      <div className="flex items-center gap-3 mb-4">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white uppercase tracking-tight">AUTONOMY CONTROL</h2>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-6" data-testid="autonomy-progress">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase">Current Level</span>
          <span className="code-font text-2xl font-bold text-cyan-400">{currentLevel}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 bg-black/30 rounded-full overflow-hidden mb-2">
          <div
            className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 via-green-500 to-cyan-500 transition-all duration-1000 ease-out"
            style={{ width: `${getCurrentValue()}%` }}
          ></div>
        </div>

        {/* Level Labels */}
        <div className="flex justify-between text-xs text-gray-500 code-font">
          {autonomyLevels.map((level) => (
            <span key={level.level} className={currentLevel === level.level ? 'text-cyan-400 font-bold' : ''}>
              {level.level}
            </span>
          ))}
        </div>
      </div>

      {/* Level Selection Buttons */}
      <div className="space-y-2 mb-4">
        {autonomyLevels.map((item) => {
          const colors = getColorClass(item.color);
          const isAnimating = animatingTo === item.level;
          
          return (
            <button
              key={item.level}
              onClick={() => updateAutonomyLevel(item.level)}
              disabled={updating}
              className={`w-full text-left p-3 rounded border-2 transition-all relative overflow-hidden ${
                currentLevel === item.level
                  ? `${colors.border} ${colors.text} bg-black/40`
                  : 'border-gray-700 hover:border-gray-600 bg-black/20'
              } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              data-testid={`autonomy-level-${item.level}`}
            >
              {isAnimating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              )}
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <span className="code-font text-lg font-bold">{item.level}</span>
                  {currentLevel === item.level && (
                    <span className="status-active"></span>
                  )}
                  {isAnimating && (
                    <TrendingUp className="w-4 h-4 animate-bounce" />
                  )}
                </div>
                <span className="text-xs font-bold uppercase">{item.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 relative z-10">{item.description}</p>
            </button>
          );
        })}
      </div>

      {/* Change History */}
      <div className="bg-black/30 rounded p-3">
        <div className="text-xs text-gray-400 uppercase mb-2">Recent Changes</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {history.length > 0 ? (
            history.slice(0, 5).map((entry, idx) => (
              <div key={idx} className="text-xs code-font text-gray-500 flex items-center justify-between">
                <span>{entry.old_level} → {entry.new_level}</span>
                <span className="text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          ) : (
            <div className="text-xs code-font text-gray-600">No recent changes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutonomyPanel;
