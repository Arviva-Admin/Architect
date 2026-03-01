import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationArea = () => {
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      // In production, this would come from WebSocket
      addNotification({
        type: 'info',
        title: 'System Update',
        message: 'Cognitive Engine completed reasoning task',
        timestamp: new Date()
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [{ ...notification, id }, ...prev].slice(0, 10));
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      default:
        return 'border-cyan-500/30 bg-cyan-500/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 z-50" data-testid="notification-area">
      {/* Header */}
      <div className="glass rounded-t-sm p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white uppercase">Live Notifications</span>
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 bg-cyan-500 text-black rounded-full text-xs font-bold">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-white uppercase"
              data-testid="clear-notifications"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
            data-testid="toggle-notifications"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notification List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass rounded-b-sm overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  No new notifications
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      className={`border rounded p-3 ${getColorClass(notification.type)}`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm mb-1">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-300">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-500 code-font mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-white"
                          data-testid={`close-notification-${notification.id}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationArea;
