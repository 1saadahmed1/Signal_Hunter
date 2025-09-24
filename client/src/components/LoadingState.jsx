// src/components/LoadingState.jsx
import React, { useEffect, useState } from 'react';
import { Loader2, Activity } from 'lucide-react';

export function LoadingState({ progress, isDarkMode }) {
  const [smoothProgress, setSmoothProgress] = useState(0);
  
  useEffect(() => {
    const targetProgress = progress.progress * 100;
    const animationDuration = 300;
    const startProgress = smoothProgress;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const fraction = Math.min(elapsed / animationDuration, 1);
      const easeOutCubic = 1 - Math.pow(1 - fraction, 3);
      const currentProgress = startProgress + (targetProgress - startProgress) * easeOutCubic;
      
      setSmoothProgress(currentProgress);
      
      if (fraction < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [progress.progress]);
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <Activity className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="w-full max-w-md mb-4">
          <div className={`relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 overflow-hidden`}>
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }}
            />
            
            <div 
              className="relative h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${smoothProgress}%`,
                boxShadow: smoothProgress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
              }}
            >
              {smoothProgress > 0 && smoothProgress < 100 && (
                <div 
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          <div className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {Math.round(smoothProgress)}%
          </div>
        </div>
        
        <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          {progress.message || 'Hunting for signals...'}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(0, -50%) scale(1); }
          50% { opacity: 1; transform: translate(0, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}