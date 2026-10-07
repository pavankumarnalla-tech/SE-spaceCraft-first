import type { DangerObstacle, Vector2D } from './types';

export interface DetectedThreat {
  obstacle: DangerObstacle;
  distance: number;
  inTrajectoryPath: boolean;
}

export class Sensors {
  public static scanForDangers(
    craftPos: Vector2D,
    craftVel: Vector2D,
    craftSpeed: number,
    sensorRadius: number,
    obstacle: DangerObstacle
  ): DetectedThreat | null {
    const dx = obstacle.position.x - craftPos.x;
    const dy = obstacle.position.y - craftPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if obstacle is within sensor range + its own safety radius
    if (distance <= sensorRadius + obstacle.hazardRadius) {
      let inTrajectoryPath = false;
      
      if (craftSpeed > 0.1) {
        const vxNorm = craftVel.x / craftSpeed;
        const vyNorm = craftVel.y / craftSpeed;
        const dot = dx * vxNorm + dy * vyNorm;
        
        // If the obstacle is generally in front of us
        if (dot > 0) {
          const projX = craftPos.x + vxNorm * dot;
          const projY = craftPos.y + vyNorm * dot;
          
          const perpDist = Math.sqrt(
            Math.pow(obstacle.position.x - projX, 2) +
            Math.pow(obstacle.position.y - projY, 2)
          );

          if (perpDist < obstacle.hazardRadius + 20) {
            inTrajectoryPath = true;
          }
        }
      }

      return {
        obstacle,
        distance,
        inTrajectoryPath,
      };
    }
    
    return null;
  }
}
