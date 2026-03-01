import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DocumentationViewer = () => {
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      const response = await axios.get(`${API}/documentation/architecture`);
      setDocumentation(response.data);
    } catch (error) {
      console.error('Failed to fetch documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocs = () => {
    window.open(`${API}/documentation/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-cyan-400 code-font">LOADING DOCUMENTATION...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header */}
      <header className="border-b border-gray-800 glass">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="btn-tactical bg-gray-700 text-white hover:bg-gray-600" data-testid="back-to-dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="docs-title">
                  ARCHITECTURE DOCUMENTATION
                </h1>
                <p className="text-sm text-gray-400 mt-1 code-font">Complete System Blueprint</p>
              </div>
            </div>
            <button
              onClick={downloadDocs}
              className="btn-tactical-primary flex items-center gap-2"
              data-testid="download-docs-button"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD JSON
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto" data-testid="docs-tabs">
          {['overview', 'components', 'api', 'control_flow', 'safety', 'self_improvement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn-tactical ${
                activeTab === tab
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Content Display */}
        <div className="glass rounded-sm p-6" data-testid="docs-content">
          {activeTab === 'overview' && documentation?.overview && (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">SYSTEM OVERVIEW</h2>
              <p className="text-gray-300 mb-4">{documentation.overview.description}</p>
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-3">KEY FEATURES</h3>
                <ul className="space-y-2">
                  {documentation.overview.key_features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <span className="text-cyan-400 mt-1">▸</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'components' && documentation?.components && (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">SYSTEM COMPONENTS</h2>
              <div className="space-y-6">
                {Object.entries(documentation.components).map(([category, components]) => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase">{category.replace('_', ' ')}</h3>
                    <div className="space-y-4">
                      {Object.entries(components).map(([name, details]) => (
                        <div key={name} className="border-l-2 border-cyan-500 pl-4">
                          <h4 className="font-bold text-cyan-400 uppercase">{name.replace('_', ' ')}</h4>
                          <p className="text-gray-300 text-sm mt-1">{details.description}</p>
                          {details.responsibilities && (
                            <ul className="mt-2 space-y-1">
                              {details.responsibilities.map((resp, idx) => (
                                <li key={idx} className="text-xs text-gray-400">• {resp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && documentation?.api_endpoints && (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">API ENDPOINTS</h2>
              <div className="space-y-6">
                {Object.entries(documentation.api_endpoints.endpoints).map(([category, endpoints]) => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase">{category}</h3>
                    <div className="space-y-3">
                      {Array.isArray(endpoints) ? endpoints.map((endpoint, idx) => (
                        <div key={idx} className="glass rounded p-3 code-font text-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-cyan-500 text-black rounded text-xs font-bold">
                              {endpoint.method || endpoint.protocol}
                            </span>
                            <span className="text-cyan-400">{endpoint.path}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{endpoint.description}</p>
                        </div>
                      )) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'control_flow' && documentation?.control_flow && (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">EXECUTION CONTROL FLOW</h2>
              <div className="space-y-6">
                {Object.entries(documentation.control_flow).map(([section, content]) => (
                  <div key={section}>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase">{section.replace('_', ' ')}</h3>
                    {content.steps && (
                      <ol className="space-y-2">
                        {content.steps.map((step, idx) => (
                          <li key={idx} className="text-gray-300 code-font text-sm">{step}</li>
                        ))}
                      </ol>
                    )}
                    {typeof content === 'object' && !content.steps && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(content).map(([key, value]) => (
                          <div key={key} className="glass rounded p-3">
                            <h4 className="font-bold text-cyan-400 mb-1">{key}</h4>
                            <p className="text-xs text-gray-400 mb-1">{value.name}</p>
                            <p className="text-sm text-gray-300">{value.behavior}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety' && documentation?.safety_policies && (
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-4">SAFETY POLICIES</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">ENFORCEMENT MECHANISMS</h3>
                  <ul className="space-y-1">
                    {documentation.safety_policies.enforcement_mechanisms.map((mech, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">▸ {mech}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">FORBIDDEN OPERATIONS</h3>
                  <ul className="space-y-1">
                    {documentation.safety_policies.forbidden_operations.map((op, idx) => (
                      <li key={idx} className="text-red-400 text-sm code-font">✗ {op}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">RESOURCE LIMITS</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(documentation.safety_policies.resource_limits).map(([key, value]) => (
                      <div key={key} className="glass rounded p-3">
                        <div className="text-xs text-gray-400 uppercase mb-1">{key.replace('_', ' ')}</div>
                        <div className="text-lg code-font text-cyan-400">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'self_improvement' && documentation?.self_improvement && (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">SELF-IMPROVEMENT PIPELINE</h2>
              <p className="text-gray-300 mb-6">{documentation.self_improvement.description}</p>
              <div className="space-y-6">
                {documentation.self_improvement.improvement_cycle && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">IMPROVEMENT CYCLE</h3>
                    <ol className="space-y-2">
                      {documentation.self_improvement.improvement_cycle.steps.map((step, idx) => (
                        <li key={idx} className="text-gray-300 code-font text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentationViewer;
