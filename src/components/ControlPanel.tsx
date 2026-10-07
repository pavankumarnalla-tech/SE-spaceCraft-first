import React from 'react';
import { SimulationEngine } from '../simulation/SimulationEngine';
import type { MissionState } from '../simulation/types';

interface ControlPanelProps {
  engine: SimulationEngine;
  status: MissionState;
  onStateChange: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ engine, status, onStateChange }) => {
  const isRunning = status !== 'IDLE' && status !== 'MISSION_COMPLETED';

  const handleStart = () => {
    if (!isRunning && status === 'IDLE') {
      engine.startMission();
      onStateChange();
    }
  };

  const handleReset = () => {
    engine.resetMission();
    onStateChange();
  };

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={handleStart}
        disabled={isRunning || status === 'MISSION_COMPLETED'}
        className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
      >
        Start Mission
      </button>

      <button
        onClick={handleReset}
        className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
      >
        Reset Mission
      </button>
    </div>
  );
};
