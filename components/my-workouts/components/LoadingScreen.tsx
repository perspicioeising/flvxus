import React from 'react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-app-achievement-workout/30 rounded-full animate-spin border-t-app-achievement-workout"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-app-achievement-workout/50"></div>
        </div>
      </div>
    </div>
  );
}
