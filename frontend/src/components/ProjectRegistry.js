import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderGit2, Power, AlertTriangle, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedProjectRegistry = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dependencies, setDependencies] = useState(null);
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

  const fetchDependencies = async (projectId) => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/dependencies`);
      setDependencies(response.data);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  };

  const toggleProjectStatus = async (project) => {
    const action = project.status === 'active' ? 'deactivate' : 'activate';
    
    // Show confirmation for deactivation
    if (project.status === 'active') {
      if (!window.confirm(`Are you sure you want to deactivate "${project.name}"? This may affect dependent modules.`)) {
        return;
      }
    }

    setTogglingProject(project.id);

    try {
      const response = await axios.post(`${API}/projects/${project.id}/toggle`);
      
      if (response.data.success) {
        toast.success(
          <div>
            <strong>Project {action}d</strong>
            <div className=\"text-xs mt-1\">{project.name}</div>
          </div>
        );
        
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

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    await fetchDependencies(project.id);
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-400' : 'text-gray-500';
  };

  const getStatusIndicator = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className=\"glass rounded-sm p-6\" data-testid=\"enhanced-project-registry\">\n      <div className=\"flex items-center justify-between mb-4\">\n        <div className=\"flex items-center gap-3\">\n          <FolderGit2 className=\"w-5 h-5 text-cyan-400\" />\n          <h2 className=\"text-lg font-bold text-white uppercase tracking-tight\">PROJECT REGISTRY</h2>\n        </div>\n        {stats && (\n          <div className=\"text-xs code-font text-gray-400\">\n            {stats.active_projects}/{stats.total_projects} Active\n          </div>\n        )}\n      </div>\n\n      {/* Stats Grid */}\n      {stats && (\n        <div className=\"grid grid-cols-3 gap-3 mb-4\">\n          <div className=\"bg-black/30 rounded p-3\">\n            <div className=\"text-xs text-gray-400 uppercase mb-1\">Total</div>\n            <div className=\"code-font text-xl text-white\">{stats.total_projects}</div>\n          </div>\n          <div className=\"bg-black/30 rounded p-3\">\n            <div className=\"text-xs text-gray-400 uppercase mb-1\">Active</div>\n            <div className=\"code-font text-xl text-green-400\">{stats.active_projects}</div>\n          </div>\n          <div className=\"bg-black/30 rounded p-3\">\n            <div className=\"text-xs text-gray-400 uppercase mb-1\">Languages</div>\n            <div className=\"code-font text-xl text-cyan-400\">\n              {Object.keys(stats.by_language || {}).length}\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Project List */}\n      <div className=\"space-y-2 max-h-80 overflow-y-auto mb-4\">\n        {projects.map((project) => (\n          <div\n            key={project.id}\n            className=\"border border-gray-700 rounded p-3 hover:border-cyan-500/50 transition-colors\"\n            data-testid={`project-${project.id}`}\n          >\n            <div className=\"flex items-center justify-between mb-2\">\n              <div\n                className=\"flex items-center gap-2 flex-1 cursor-pointer\"\n                onClick={() => handleProjectClick(project)}\n              >\n                <div className=\"font-bold text-white\">{project.name}</div>\n                <span className={getStatusIndicator(project.status)}></span>\n              </div>\n              \n              {/* Toggle Button */}\n              <button\n                onClick={() => toggleProjectStatus(project)}\n                disabled={togglingProject === project.id}\n                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${\n                  project.status === 'active'\n                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'\n                    : 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'\n                } ${togglingProject === project.id ? 'opacity-50 cursor-not-allowed' : ''}`}\n                data-testid={`toggle-project-${project.id}`}\n              >\n                {togglingProject === project.id ? (\n                  'Processing...'\n                ) : (\n                  <span className=\"flex items-center gap-1\">\n                    <Power className=\"w-3 h-3\" />\n                    {project.status === 'active' ? 'Disable' : 'Enable'}\n                  </span>\n                )}\n              </button>\n            </div>\n            \n            <div className=\"flex items-center gap-4 text-xs code-font text-gray-400\">\n              <span>{project.type}</span>\n              <span>•</span>\n              <span>{project.language}</span>\n              <span>•</span>\n              <span className=\"text-amber-400\">{project.complexity}</span>\n            </div>\n          </div>\n        ))}\n      </div>\n\n      {/* Dependency Viewer */}\n      {selectedProject && dependencies && (\n        <div className=\"border-t border-gray-700 pt-4\" data-testid=\"dependency-viewer\">\n          <div className=\"flex items-center gap-2 mb-3\">\n            <GitBranch className=\"w-4 h-4 text-cyan-400\" />\n            <span className=\"text-sm font-bold text-white uppercase\">Dependencies: {selectedProject.name}</span>\n          </div>\n\n          {dependencies.dependencies.length > 0 ? (\n            <div className=\"space-y-2\">\n              {dependencies.dependencies.map((dep) => (\n                <div\n                  key={dep.id}\n                  className=\"bg-black/30 rounded p-2 flex items-center justify-between\"\n                >\n                  <div className=\"flex items-center gap-2\">\n                    <div className=\"text-sm text-white\">{dep.name}</div>\n                    {dep.critical && (\n                      <span className=\"flex items-center gap-1 text-xs text-red-400\">\n                        <AlertTriangle className=\"w-3 h-3\" />\n                        Critical\n                      </span>\n                    )}\n                  </div>\n                  <span className=\"text-xs code-font text-gray-400\">{dep.type}</span>\n                </div>\n              ))}\n            </div>\n          ) : (\n            <div className=\"text-sm text-gray-500 italic\">No dependencies found</div>\n          )}\n\n          <button\n            onClick={() => setSelectedProject(null)}\n            className=\"mt-3 text-xs text-gray-400 hover:text-white uppercase\"\n            data-testid=\"close-dependencies\"\n          >\n            Close\n          </button>\n        </div>\n      )}\n    </div>\n  );\n};\n\nexport default EnhancedProjectRegistry;
