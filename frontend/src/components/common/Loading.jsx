// frontend/src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-neuro-dark flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-neuro-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default Loading;