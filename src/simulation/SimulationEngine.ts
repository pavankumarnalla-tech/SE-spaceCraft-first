import { Spacecraft } from './Spacecraft';
import { AutonomousController } from './AutonomousController';
import { Environment } from './Environment';
import { Sensors } from './Sensors';
import type { TelemetryFrame, Destination } from './types';

export class SimulationEngine {
  public spacecraft: Spacecraft;
  public environment: Environment;
  public controller: AutonomousController;

  private isRunning: boolean = false;
  private missionName: string = 'Mission 01';
  private startTime: number = 0;
  private endTime: number = 0;
  private currentDuration: number = 0;

  constructor(width: number = 900, height: number = 500) {
    this.spacecraft = new Spacecraft({ x: 100, y: height / 2 });
    this.environment = new Environment(width, height);
    this.controller = new AutonomousController();
  }

  public configureMission(name: string, dest: Destination): void {
    this.missionName = name;
    this.environment.setDestination(dest);
  }

  public startMission(): void {
    if (this.spacecraft.getState().status === 'IDLE') {
      this.spacecraft.setStatus('TRAVELLING');
      this.isRunning = true;
      this.startTime = Date.now();
      this.endTime = 0;
      this.currentDuration = 0;
    }
  }

  public resetMission(width: number = 900, height: number = 500): void {
    this.isRunning = false;
    this.startTime = 0;
    this.endTime = 0;
    this.currentDuration = 0;
    this.spacecraft.reset({ x: 100, y: height / 2 });
    this.environment.reset(width, height);
    this.controller.reset();
  }

  public update(deltaTimeSeconds: number): void {
    if (!this.isRunning) return;

    this.currentDuration = (Date.now() - this.startTime) / 1000;

    const craftState = this.spacecraft.getState();
    const destination = this.environment.getDestination();
    const obstacle = this.environment.getObstacle();

    const threat = Sensors.scanForDangers(
      craftState.position,
      craftState.velocity,
      craftState.speed,
      craftState.sensorRadius,
      obstacle
    );

    const controlOutput = this.controller.computeControl(
      craftState,
      destination,
      threat,
      deltaTimeSeconds
    );

    if (controlOutput.activeMode === 'MISSION_COMPLETED') {
      this.spacecraft.setStatus('MISSION_COMPLETED');
      this.spacecraft.updatePhysics({ x: 0, y: 0 }, deltaTimeSeconds);
      this.isRunning = false;
      this.endTime = Date.now();
      this.currentDuration = (this.endTime - this.startTime) / 1000;
    } else {
      this.spacecraft.setStatus(controlOutput.activeMode);
      this.spacecraft.updatePhysics(controlOutput.desiredVelocity, deltaTimeSeconds);
    }
  }

  public getTelemetry(): TelemetryFrame {
    const craftState = this.spacecraft.getState();
    const dest = this.environment.getDestination();

    const dx = dest.position.x - craftState.position.x;
    const dy = dest.position.y - craftState.position.y;
    const distToTarget = Math.sqrt(dx * dx + dy * dy);

    return {
      missionName: this.missionName,
      destinationName: dest.name,
      position: { ...craftState.position },
      speed: Number(craftState.speed.toFixed(2)),
      distanceToTarget: Number(distToTarget.toFixed(1)),
      fuel: Number(craftState.fuel.toFixed(1)),
      status: craftState.status,
      duration: this.currentDuration,
    };
  }
}
