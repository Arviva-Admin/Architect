import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderGit2, Power } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProjectRegistry = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [togglingProject, setTogglingProject] = useState(null);

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

  const toggleProjectStatus = async (project) => {
    const action = project.status === 'active' ? 'deactivate' : 'activate';
    
    // Show confirmation for deactivation
    if (project.status === 'active') {
      if (!window.confirm(`Are you sure you want to deactivate "${project.name}"?`)) {
        return;
      }
    }

    setTogglingProject(project.id);

    try {
      const response = await axios.post(`${API}/projects/${project.id}/toggle`);
      
      if (response.data.success) {
        toast.success(`Project ${action}d: ${project.name}`);
        
        // Refresh projects
        await fetchProjects();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to toggle project:', error);
      toast.error(`Failed to ${action} project`);
    } finally {
      setTogglingProject(null);
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

      {/* Project List with Toggle */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-700 rounded p-3 hover:border-cyan-500/50 transition-colors"
            data-testid={`project-${project.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="font-bold text-white">{project.name}</div>
                <span
                  className={project.status === 'active' ? 'status-active' : 'status-inactive'}
                ></span>
              </div>
              
              {/* Toggle Button */}
              <button
                onClick={() => toggleProjectStatus(project)}
                disabled={togglingProject === project.id}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                  project.status === 'active'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                } ${togglingProject === project.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid={`toggle-project-${project.id}`}
              >
                <Power className="w-3 h-3" />
                {togglingProject === project.id ? 'Processing...' : (project.status === 'active' ? 'Disable' : 'Enable')}
              </button>
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
