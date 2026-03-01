"""State Graph - Fast in-memory graph for reasoning and state management"""
import logging
import networkx as nx
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import time

logger = logging.getLogger(__name__)

class StateGraph:
    """Fast in-memory state graph using NetworkX"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.metadata = {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "version": "1.0.0"
        }
        self._init_demo_graph()
        logger.info("State Graph initialized")
    
    def _init_demo_graph(self):
        """Initialize demonstration graph structure"""
        # Add core nodes
        nodes = [
            {"id": "control_kernel", "type": "core", "label": "Control Kernel", "status": "active"},
            {"id": "cognitive_engine", "type": "core", "label": "Cognitive Engine", "status": "active"},
            {"id": "proxy_executor", "type": "execution", "label": "Proxy Executor", "status": "ready"},
            {"id": "shadow_world", "type": "simulation", "label": "Shadow World", "status": "ready"},
            {"id": "rollback_manager", "type": "safety", "label": "Rollback Manager", "status": "active"},
            {"id": "project_1", "type": "project", "label": "Project Alpha", "status": "indexed"},
            {"id": "project_2", "type": "project", "label": "Project Beta", "status": "indexed"},
            {"id": "autonomy_manager", "type": "policy", "label": "Autonomy Manager", "status": "active"}
        ]
        
        for node in nodes:
            self.add_node(node["id"], node)
        
        # Add edges (relationships)
        edges = [
            ("control_kernel", "proxy_executor", {"type": "controls"}),
            ("control_kernel", "autonomy_manager", {"type": "enforces"}),
            ("cognitive_engine", "project_1", {"type": "analyzes"}),
            ("cognitive_engine", "project_2", {"type": "analyzes"}),
            ("proxy_executor", "shadow_world", {"type": "simulates_in"}),
            ("rollback_manager", "shadow_world", {"type": "monitors"}),
            ("rollback_manager", "project_1", {"type": "protects"}),
            ("rollback_manager", "project_2", {"type": "protects"})
        ]
        
        for source, target, attrs in edges:
            self.add_edge(source, target, attrs)
    
    def add_node(self, node_id: str, attributes: Dict[str, Any]) -> bool:
        """Add node to graph"""
        try:
            self.graph.add_node(node_id, **attributes)
            logger.debug(f"Node added: {node_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to add node: {str(e)}")
            return False
    
    def add_edge(self, source: str, target: str, attributes: Dict[str, Any]) -> bool:
        """Add edge to graph"""
        try:
            self.graph.add_edge(source, target, **attributes)
            logger.debug(f"Edge added: {source} -> {target}")
            return True
        except Exception as e:
            logger.error(f"Failed to add edge: {str(e)}")
            return False
    
    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Get node data"""
        if node_id in self.graph.nodes:
            return dict(self.graph.nodes[node_id])
        return None
    
    def get_neighbors(self, node_id: str) -> List[str]:
        """Get node neighbors"""
        if node_id in self.graph.nodes:
            return list(self.graph.neighbors(node_id))
        return []
    
    def query_graph(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Query graph with fast response (<2s)"""
        start_time = time.time()
        query_type = query.get("type", "full")
        
        try:
            if query_type == "full":
                result = self.get_full_graph()
            elif query_type == "node":
                node_id = query.get("node_id")
                result = self.get_node(node_id)
            elif query_type == "neighbors":
                node_id = query.get("node_id")
                result = self.get_neighbors(node_id)
            elif query_type == "path":
                source = query.get("source")
                target = query.get("target")
                result = self._find_path(source, target)
            else:
                result = {"error": "Unknown query type"}
            
            elapsed_ms = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "result": result,
                "elapsed_ms": elapsed_ms,
                "query_type": query_type
            }
            
        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            return {
                "success": False,
                "error": str(e),
                "elapsed_ms": elapsed_ms
            }
    
    def get_full_graph(self) -> Dict[str, Any]:
        """Get full graph structure for visualization"""
        nodes = []
        for node_id, attrs in self.graph.nodes(data=True):
            node_data = {"id": node_id, **attrs}
            nodes.append(node_data)
        
        links = []
        for source, target, attrs in self.graph.edges(data=True):
            link_data = {"source": source, "target": target, **attrs}
            links.append(link_data)
        
        return {
            "nodes": nodes,
            "links": links,
            "metadata": self.metadata,
            "stats": {
                "node_count": self.graph.number_of_nodes(),
                "edge_count": self.graph.number_of_edges()
            }
        }
    
    def _find_path(self, source: str, target: str) -> List[str]:
        """Find shortest path between nodes"""
        try:
            path = nx.shortest_path(self.graph, source, target)
            return path
        except nx.NetworkXNoPath:
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get graph statistics"""
        return {
            "node_count": self.graph.number_of_nodes(),
            "edge_count": self.graph.number_of_edges(),
            "density": nx.density(self.graph),
            "is_connected": nx.is_weakly_connected(self.graph),
            "metadata": self.metadata
        }

# Global instance
state_graph = StateGraph()
