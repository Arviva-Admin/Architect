"""Project Indexer - Multi-project metadata indexer"""
import logging
import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ProjectIndexer:
    """Indexes and manages multiple projects"""
    
    def __init__(self):
        self.projects = {}
        self._init_demo_projects()
        logger.info("Project Indexer initialized")
    
    def _init_demo_projects(self):
        """Initialize demo projects"""
        demo_projects = [
            {
                "name": "Project Alpha",
                "type": "web_application",
                "language": "python",
                "status": "active",
                "complexity": "medium"
            },
            {
                "name": "Project Beta",
                "type": "api_service",
                "language": "javascript",
                "status": "active",
                "complexity": "low"
            },
            {
                "name": "Project Gamma",
                "type": "data_pipeline",
                "language": "python",
                "status": "inactive",
                "complexity": "high"
            }
        ]
        
        for project_data in demo_projects:
            self.register_project(project_data)
    
    def register_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register new project"""
        project_id = str(uuid.uuid4())
        
        project = {
            "id": project_id,
            "name": project_data.get("name", "Unnamed Project"),
            "type": project_data.get("type", "unknown"),
            "language": project_data.get("language", "unknown"),
            "status": project_data.get("status", "active"),
            "complexity": project_data.get("complexity", "medium"),
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "last_indexed": datetime.now(timezone.utc).isoformat(),
            "metadata": project_data.get("metadata", {})
        }
        
        self.projects[project_id] = project
        logger.info(f"Project registered: {project['name']} ({project_id})")
        
        return {
            "success": True,
            "project_id": project_id,
            "name": project["name"]
        }
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project details"""
        return self.projects.get(project_id)
    
    def list_projects(self, filter_status: str = None) -> List[Dict[str, Any]]:
        """List all projects with optional status filter"""
        projects = list(self.projects.values())
        
        if filter_status:
            projects = [p for p in projects if p["status"] == filter_status]
        
        return projects
    
    def update_project(self, project_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update project metadata"""
        if project_id not in self.projects:
            return {"success": False, "error": "Project not found"}
        
        project = self.projects[project_id]
        project.update(updates)
        project["last_indexed"] = datetime.now(timezone.utc).isoformat()
        
        logger.info(f"Project updated: {project_id}")
        
        return {"success": True, "project_id": project_id}
    
    def get_stats(self) -> Dict[str, Any]:
        """Get indexer statistics"""
        projects = list(self.projects.values())
        
        return {
            "total_projects": len(projects),
            "active_projects": len([p for p in projects if p["status"] == "active"]),
            "by_type": self._count_by_field(projects, "type"),
            "by_language": self._count_by_field(projects, "language"),
            "by_complexity": self._count_by_field(projects, "complexity")
        }
    
    def _count_by_field(self, projects: List[Dict[str, Any]], field: str) -> Dict[str, int]:
        """Count projects by field"""
        counts = {}
        for project in projects:
            value = project.get(field, "unknown")
            counts[value] = counts.get(value, 0) + 1
        return counts

# Global instance
project_indexer = ProjectIndexer()
