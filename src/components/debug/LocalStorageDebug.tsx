'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StorageFallback } from '@/lib/storage-fallback';

export function LocalStorageDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const refreshDebugInfo = () => {
    if (!user) return;

    const gameProgress = StorageFallback.loadGameProgress(user.id);
    const schoolDate = StorageFallback.loadSchoolDate(user.id);
    const seasonMap = StorageFallback.loadSeasonMap(user.id);

    setDebugInfo({
      userId: user.id,
      hasGameProgress: !!gameProgress,
      hasSchoolDate: !!schoolDate,
      hasSeasonMap: !!seasonMap,
      gameProgress,
      schoolDate,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [user]);

  const clearAllData = () => {
    if (!user) return;
    StorageFallback.clearAllData(user.id);
    refreshDebugInfo();
    alert('All localStorage data cleared!');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md overflow-auto max-h-64 z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">🔧 Debug Info</h3>
        <button onClick={refreshDebugInfo} className="bg-blue-600 px-2 py-1 rounded">
          Refresh
        </button>
      </div>
      
      {debugInfo && (
        <div className="space-y-2">
          <div>User ID: {debugInfo.userId.slice(0, 8)}...</div>
          <div>Game Progress: {debugInfo.hasGameProgress ? '✅' : '❌'}</div>
          <div>School Date: {debugInfo.hasSchoolDate ? '✅' : '❌'}</div>
          <div>Season Map: {debugInfo.hasSeasonMap ? '✅' : '❌'}</div>
          
          {debugInfo.schoolDate && (
            <div className="bg-gray-800 p-2 rounded mt-2">
              <div>📅 Current Date:</div>
              <div>{debugInfo.schoolDate.current_month}月{debugInfo.schoolDate.current_day}日</div>
            </div>
          )}
          
          {debugInfo.gameProgress && (
            <div className="bg-gray-800 p-2 rounded mt-2">
              <div>🎮 Game Progress:</div>
              <div>{debugInfo.gameProgress.currentMonth}月{debugInfo.gameProgress.currentDay}日</div>
              <div>Position: {debugInfo.gameProgress.currentPosition}</div>
            </div>
          )}
          
          <button 
            onClick={clearAllData} 
            className="bg-red-600 px-2 py-1 rounded w-full mt-2"
          >
            Clear All Data
          </button>
        </div>
      )}
    </div>
  );
}