export type MissionState =
  | 'IDLE'
  | 'TRAVELLING'
  | 'DANGER_DETECTED'
  | 'AVOIDING'
  | 'MISSION_COMPLETED';

export interface Vector2D {
  x: number;
  y: number;
}

export interface SpacecraftState {
  position: Vector2D;
  velocity: Vector2D;
  heading: number;
  speed: number;
  maxSpeed: number;
  fuel: number;
  maxFuel: number;
  sensorRadius: number;
  status: MissionState;
}

export interface Destination {
  id: string;
  name: string;
  position: Vector2D;
  arrivalRadius: number;
}

export interface DangerObstacle {
  position: Vector2D;
  radius: number;
  hazardRadius: number;
}

export interface TelemetryFrame {
  missionName: string;
  destinationName: string;
  position: Vector2D;
  speed: number;
  distanceToTarget: number;
  fuel: number;
  status: MissionState;
  duration: number;
}

export const PREDEFINED_DESTINATIONS: Destination[] = [
  { id: 'lunar', name: 'Lunar Station', position: { x: 800, y: 250 }, arrivalRadius: 30 },
  { id: 'mars', name: 'Mars Outpost', position: { x: 850, y: 150 }, arrivalRadius: 30 },
  { id: 'orbital', name: 'Orbital Station', position: { x: 750, y: 350 }, arrivalRadius: 30 }
];
