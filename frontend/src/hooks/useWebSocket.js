import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Convert HTTP URL to WebSocket URL
    const wsUrl = url.replace('https://', 'wss://').replace('http://', 'ws://');
    
    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setData(message);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        wsRef.current.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('WebSocket connection error');
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        setError(err.message);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return { data, isConnected, error, sendMessage };
};

export const useSystemState = () => {
  const wsUrl = `${BACKEND_URL}/ws/system-state`;
  const { data, isConnected, error } = useWebSocket(wsUrl);
  const [systemState, setSystemState] = useState({
    controlKernel: null,
    cognitiveEngine: null,
    graph: null
  });

  useEffect(() => {
    if (data) {
      if (data.type === 'initial_state') {
        setSystemState({
          controlKernel: data.data.control_kernel,
          cognitiveEngine: data.data.cognitive_engine,
          graph: data.data.graph
        });
      } else if (data.type === 'status_update') {
        setSystemState({
          controlKernel: data.data.control_kernel,
          cognitiveEngine: data.data.cognitive_engine,
          graph: systemState.graph
        });
      }
    }
  }, [data]);

  return { systemState, isConnected, error };
};
