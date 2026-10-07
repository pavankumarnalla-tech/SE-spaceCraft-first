import { PREDEFINED_DESTINATIONS } from './types';
import type { Destination, DangerObstacle } from './types';

export class Environment {
  private destination: Destination;
  private obstacle: DangerObstacle;

  constructor(canvasWidth: number = 900, canvasHeight: number = 500) {
    this.destination = PREDEFINED_DESTINATIONS[0];

    // Fixed obstacle centrally placed to guarantee avoidance scenario
    this.obstacle = {
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      radius: 35,
      hazardRadius: 85,
    };
  }

  public getDestination(): Destination {
    return this.destination;
  }

  public setDestination(dest: Destination): void {
    this.destination = dest;
  }

  public getObstacle(): DangerObstacle {
    return this.obstacle;
  }

  public reset(canvasWidth: number = 900, canvasHeight: number = 500): void {
    this.destination = PREDEFINED_DESTINATIONS[0];

    this.obstacle = {
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      radius: 35,
      hazardRadius: 85,
    };
  }
}
