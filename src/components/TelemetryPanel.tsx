import React from 'react';
import type { TelemetryFrame } from '../simulation/types';

interface TelemetryPanelProps {
  telemetry: TelemetryFrame;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry }) => {
  const getStatusText = () => {
    switch (telemetry.status) {
      case 'IDLE': return 'Ready';
      case 'TRAVELLING': return 'Travelling';
      case 'DANGER_DETECTED': return 'Obstacle Detected';
      case 'AVOIDING': return 'Avoiding Obstacle';
      case 'MISSION_COMPLETED': return 'Mission Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 h-full flex flex-col justify-start gap-6 shadow-lg">
      
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Mission Name</div>
        <div className="text-lg font-bold text-white">{telemetry.missionName}</div>
      </div>
      
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Destination</div>
        <div className="text-lg font-bold text-white">{telemetry.destinationName}</div>
      </div>

      <div className="pt-4 border-t border-slate-700/50">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Mission Status</div>
        <div className="text-xl font-bold text-white">{getStatusText()}</div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Distance to Target</div>
        <div className="text-xl font-bold text-white">
          {telemetry.distanceToTarget} <span className="text-base text-slate-500 font-normal">km</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Velocity</div>
        <div className="text-xl font-bold text-white">
          {telemetry.speed} <span className="text-base text-slate-500 font-normal">km/s</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Fuel</div>
        <div className="text-xl font-bold text-white">
          {telemetry.fuel} <span className="text-base text-slate-500 font-normal">%</span>
        </div>
      </div>

    </div>
  );
};
