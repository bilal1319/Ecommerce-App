import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ToastItem = ({ id, type, message, duration, onRemove, isExiting }) => {
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);

  const iconMap = {
    success: { 
      Icon: CheckCircle, 
      textColor: 'text-green-500',
      progressColor: 'bg-green-500'
    },
    error: { 
      Icon: XCircle, 
      textColor: 'text-red-500',
      progressColor: 'bg-red-500'
    },
    warning: { 
      Icon: AlertTriangle, 
      textColor: 'text-yellow-500',
      progressColor: 'bg-yellow-500'
    },
    info: { 
      Icon: Info, 
      textColor: 'text-blue-500',
      progressColor: 'bg-blue-500'
    }
  };

  const { Icon, textColor, progressColor } = iconMap[type] || iconMap.info;

  useEffect(() => {
    if (isExiting) return;

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress <= 0) {
          clearInterval(timer);
          onRemove(id);
          return 0;
        }
        return prevProgress - (100 / (duration / 10));
      });
    }, 10);

    return () => clearInterval(timer);
  }, [duration, id, onRemove, isExiting]);

  return (
    <div 
      className={`
        relative w-80 bg-white border shadow-lg rounded-lg mb-2 overflow-hidden 
        ${isExiting ? 'toast-exit' : 'toast-enter'}
        cursor-pointer hover:shadow-xl transition-shadow duration-300
      `}
      onClick={() => !isExiting && onRemove(id)}
    >
      <div className="flex items-center p-4 pr-10 relative">
        <Icon className={`mr-3 ${textColor}`} size={24} />
        <span className={`text-sm font-medium flex-grow ${textColor}`}>{message}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            !isExiting && onRemove(id);
          }}
          className="absolute top-2 right-2 hover:bg-gray-100 rounded-full p-1"
        >
          <X size={16} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <div 
        ref={progressRef}
        className={`absolute bottom-0 left-0 h-1 ${progressColor} opacity-50`} 
        style={{ 
          width: `${progress}%`, 
          transition: 'width 0.01s linear' 
        }}
      />
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [exitingToasts, setExitingToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now();
    
    const newToast = { id, type, message, duration };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);

    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);

    return () => {
      clearTimeout(timer);
      removeToast(id);
    };
  }, []);

  const removeToast = useCallback((id) => {
    // Mark toast as exiting
    setExitingToasts(current => [...current, id]);

    // Remove from active toasts
    setToasts(current => current.filter(t => t.id !== id));

    // Actually remove after animation
    setTimeout(() => {
      setExitingToasts(current => current.filter(exitId => exitId !== id));
    }, 500); // Match the animation duration
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-4 right-4 z-[10999] flex flex-col">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onRemove={removeToast}
            isExiting={exitingToasts.includes(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastProvider;