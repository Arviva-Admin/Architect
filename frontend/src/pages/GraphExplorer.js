import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ForceGraph3D from 'react-force-graph-3d';
import { ArrowLeft, Maximize2, RotateCcw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GraphExplorer = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const fgRef = useRef();

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const response = await axios.get(`${API}/state-graph/full`);
      setGraphData(response.data);
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const resetCamera = () => {
    if (fgRef.current) {
      fgRef.current.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000);
    }
  };

  const getNodeColor = (node) => {
    if (node.type === 'core') return '#06b6d4'; // Cyan
    if (node.type === 'safety') return '#10b981'; // Green
    if (node.type === 'execution') return '#f59e0b'; // Amber
    if (node.type === 'policy') return '#ef4444'; // Red
    if (node.type === 'project') return '#8b5cf6'; // Purple
    return '#6b7280'; // Gray
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-cyan-400 code-font">LOADING GRAPH DATA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-gray-800 glass relative z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="btn-tactical bg-gray-700 text-white hover:bg-gray-600" data-testid="back-to-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="graph-title">
                  STATE GRAPH EXPLORER
                </h1>
                <p className="text-sm text-gray-400 mt-1 code-font">
                  Nodes: {graphData.nodes?.length || 0} | Links: {graphData.links?.length || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetCamera}
                className="btn-tactical bg-gray-700 text-white hover:bg-gray-600 flex items-center gap-2"
                data-testid="reset-camera"
              >
                <RotateCcw className="w-4 h-4" />
                RESET VIEW
              </button>
              <button
                onClick={fetchGraphData}
                className="btn-tactical-primary"
                data-testid="refresh-graph"
              >
                REFRESH
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Graph Visualization */}
        <div className="flex-1 relative" data-testid="graph-container">
          <ForceGraph3D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="label"
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={() => 'rgba(255, 255, 255, 0.2)'}
            linkWidth={2}
            backgroundColor="#00000000"
            onNodeClick={handleNodeClick}
            nodeThreeObjectExtend={true}
          />
        </div>

        {/* Side Panel */}
        {selectedNode && (
          <div className="w-80 glass border-l border-gray-800 p-6 overflow-y-auto" data-testid="node-details-panel">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-cyan-400 uppercase">NODE DETAILS</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">ID</div>
                <div className="code-font text-white text-sm">{selectedNode.id}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">LABEL</div>
                <div className="text-white">{selectedNode.label}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">TYPE</div>
                <div className="code-font text-cyan-400">{selectedNode.type}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">STATUS</div>
                <div className="flex items-center gap-2">
                  <span
                    className={selectedNode.status === 'active' ? 'status-active' : 'status-inactive'}
                  ></span>
                  <span className="code-font text-white">{selectedNode.status}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase mb-1">ALL PROPERTIES</div>
                <pre className="code-font text-xs text-gray-300 bg-black/30 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedNode, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-6 w-full btn-tactical bg-gray-700 text-white hover:bg-gray-600"
              data-testid="close-node-details"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphExplorer;
