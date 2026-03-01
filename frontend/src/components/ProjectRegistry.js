import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderGit2, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProjectRegistry = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/projects/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
    }
  };

  return (
    <div className="glass rounded-sm p-6" data-testid="project-registry">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">PROJECT REGISTRY</h2>
        </div>
        {stats && (
          <div className="text-xs code-font text-gray-400">
            {stats.active_projects}/{stats.total_projects} Active
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/30 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-1">Total</div>
            <div className="code-font text-xl text-white">{stats.total_projects}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-1">Active</div>
            <div className="code-font text-xl text-green-400">{stats.active_projects}</div>
          </div>
          <div className="bg-black/30 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-1">Languages</div>
            <div className="code-font text-xl text-cyan-400">
              {Object.keys(stats.by_language || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-700 rounded p-3 hover:border-cyan-500/50 transition-colors cursor-pointer"
            data-testid={`project-${project.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-white">{project.name}</div>
              <span
                className={project.status === 'active' ? 'status-active' : 'status-inactive'}
              ></span>
            </div>
            <div className="flex items-center gap-4 text-xs code-font text-gray-400">
              <span>{project.type}</span>
              <span>•</span>
              <span>{project.language}</span>
              <span>•</span>
              <span className="text-amber-400">{project.complexity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectRegistry;
