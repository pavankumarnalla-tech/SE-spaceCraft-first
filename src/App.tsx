import { useState, useEffect, useMemo } from 'react';
import { SimulationEngine } from './simulation/SimulationEngine';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TelemetryPanel } from './components/TelemetryPanel';
import { PREDEFINED_DESTINATIONS } from './simulation/types';

type ViewState = 'HOME' | 'SETUP' | 'SIMULATION' | 'RESULT';

interface CompletedMission {
  missionName: string;
  destination: string;
  status: string;
  finalDistance: number;
  finalFuel: number;
  missionDuration: number;
}

export function App() {
  const engine = useMemo(() => new SimulationEngine(900, 500), []);
  const [view, setView] = useState<ViewState>('HOME');
  const [, setTick] = useState(0);

  const [setupName, setSetupName] = useState('Mission 01');
  const [setupDestId, setSetupDestId] = useState(PREDEFINED_DESTINATIONS[0].id);
  
  const [completedMission, setCompletedMission] = useState<CompletedMission | null>(null);

  // Poll state to update React UI only when in SIMULATION view
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (view === 'SIMULATION') {
      interval = setInterval(() => {
        setTick((t) => t + 1);
        const currentTelemetry = engine.getTelemetry();
        if (currentTelemetry.status === 'MISSION_COMPLETED') {
           setCompletedMission({
             missionName: currentTelemetry.missionName,
             destination: currentTelemetry.destinationName,
             status: currentTelemetry.status,
             finalDistance: currentTelemetry.distanceToTarget,
             finalFuel: currentTelemetry.fuel,
             missionDuration: currentTelemetry.duration
           });
           setTimeout(() => setView('RESULT'), 1000); // 1 sec delay before moving to result screen
           clearInterval(interval);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [view, engine]);

  const telemetry = engine.getTelemetry();

  const handleStartMission = () => {
    const dest = PREDEFINED_DESTINATIONS.find(d => d.id === setupDestId) || PREDEFINED_DESTINATIONS[0];
    engine.configureMission(setupName, dest);
    engine.startMission();
    setView('SIMULATION');
  };

  const handleResetInSimulation = () => {
    engine.resetMission();
    setView('SETUP');
  };

  const handleRunAnother = () => {
    engine.resetMission();
    setView('SETUP');
  };

  const handleGoHome = () => {
    engine.resetMission();
    setView('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center p-8 font-sans text-slate-100">
      <div className="max-w-6xl w-full flex flex-col items-center">

        {view === 'HOME' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6">Autonomous Spacecraft</h1>
            <p className="text-xl text-slate-400 mb-12">Autonomous spacecraft navigation and obstacle avoidance simulation</p>
            <button
              onClick={() => setView('SETUP')}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors"
            >
              Start New Mission
            </button>
          </div>
        )}

        {view === 'SETUP' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-lg mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8">Mission Setup</h2>
            
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-8 flex flex-col gap-8 shadow-lg">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mission Name</label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Destination</label>
                <select
                  value={setupDestId}
                  onChange={(e) => setSetupDestId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  {PREDEFINED_DESTINATIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartMission}
                className="mt-2 px-6 py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-colors"
              >
                Start Mission
              </button>
            </div>
          </div>
        )}

        {view === 'SIMULATION' && (
          <div className="w-full flex flex-col gap-6">
            
            <div className="flex justify-end w-full pb-2">
              <button
                onClick={handleResetInSimulation}
                className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors shadow-sm"
              >
                Reset Mission
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
              <div className="lg:col-span-3">
                <SimulationCanvas engine={engine} width={900} height={500} />
              </div>
              <div className="lg:col-span-1">
                <TelemetryPanel telemetry={telemetry} />
              </div>
            </div>

          </div>
        )}

        {view === 'RESULT' && completedMission && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full max-w-lg mx-auto">
            <h2 className="text-4xl font-bold text-white mb-8">Mission Completed</h2>
            
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-8 mb-8 text-left space-y-4 shadow-lg">
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-semibold">Mission Name</span>
                <span className="text-white font-bold">{completedMission.missionName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-semibold">Destination</span>
                <span className="text-white font-bold">{completedMission.destination}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-semibold">Final Status</span>
                <span className="text-emerald-400 font-bold">
                  {completedMission.status === 'MISSION_COMPLETED' ? 'Mission Completed' : completedMission.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-semibold">Final Distance</span>
                <span className="text-white font-bold">{completedMission.finalDistance} km</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-semibold">Final Fuel Remaining</span>
                <span className="text-white font-bold">{completedMission.finalFuel}%</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400 font-semibold">Mission Duration</span>
                <span className="text-white font-bold">{completedMission.missionDuration.toFixed(1)}s</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRunAnother}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                Run Another Mission
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
