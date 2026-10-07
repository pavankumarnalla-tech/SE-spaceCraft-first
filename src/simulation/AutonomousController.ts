import type { SpacecraftState, Vector2D, Destination, MissionState } from './types';
import type { DetectedThreat } from './Sensors';

export interface ControllerOutput {
  desiredVelocity: Vector2D;
  activeMode: MissionState;
}

export class AutonomousController {
  private evasionStarted: boolean = false;
  private dangerDetectedTime: number = 0;

  public reset(): void {
    this.evasionStarted = false;
    this.dangerDetectedTime = 0;
  }

  public computeControl(
    craftState: SpacecraftState,
    destination: Destination,
    threat: DetectedThreat | null,
    deltaTime: number
  ): ControllerOutput {
    const craftPos = craftState.position;
    const destPos = destination.position;

    const dx = destPos.x - craftPos.x;
    const dy = destPos.y - craftPos.y;
    const distToTarget = Math.sqrt(dx * dx + dy * dy);

    // 1. Check if we reached the target
    if (distToTarget <= destination.arrivalRadius) {
      return {
        desiredVelocity: { x: 0, y: 0 },
        activeMode: 'MISSION_COMPLETED',
      };
    }

    // 2. Autonomous Avoidance Logic
    const criticalThreat = threat && (threat.inTrajectoryPath || threat.distance < threat.obstacle.hazardRadius + 30);

    if (criticalThreat) {
      if (!this.evasionStarted) {
        this.dangerDetectedTime += deltaTime;
        // Briefly enter DANGER_DETECTED state before actively avoiding
        if (this.dangerDetectedTime > 0.5) {
          this.evasionStarted = true;
        } else {
          // Slow down slightly while detecting/calculating
          return {
            desiredVelocity: { x: craftState.velocity.x * 0.8, y: craftState.velocity.y * 0.8 },
            activeMode: 'DANGER_DETECTED'
          };
        }
      }

      const obstacle = threat.obstacle;
      const obsToCraftX = craftPos.x - obstacle.position.x;
      const obsToCraftY = craftPos.y - obstacle.position.y;
      const obsDist = Math.sqrt(obsToCraftX * obsToCraftX + obsToCraftY * obsToCraftY);

      // Tangential evasion vector
      const perpX = -obsToCraftY / (obsDist || 1);
      const perpY = obsToCraftX / (obsDist || 1);

      const clearanceRadius = obstacle.hazardRadius + 60;
      const evasionTargetX = obstacle.position.x + (obsToCraftX / (obsDist || 1)) * clearanceRadius + perpX * 40;
      const evasionTargetY = obstacle.position.y + (obsToCraftY / (obsDist || 1)) * clearanceRadius + perpY * 40;

      const evDx = evasionTargetX - craftPos.x;
      const evDy = evasionTargetY - craftPos.y;
      const evDist = Math.sqrt(evDx * evDx + evDy * evDy);

      const evasiveVel: Vector2D = {
        x: (evDx / (evDist || 1)) * craftState.maxSpeed,
        y: (evDy / (evDist || 1)) * craftState.maxSpeed,
      };

      return {
        desiredVelocity: evasiveVel,
        activeMode: 'AVOIDING',
      };
    }

    // Threat cleared, reset evasion flags
    if (this.evasionStarted && !criticalThreat) {
      this.evasionStarted = false;
      this.dangerDetectedTime = 0;
    }

    // 3. Normal Trajectory (TRAVELLING)
    let speed = craftState.maxSpeed;
    if (distToTarget < 150) {
      // Slow down on approach
      speed = Math.max(1.0, craftState.maxSpeed * (distToTarget / 150));
    }

    const finalTargetVel: Vector2D = {
      x: (dx / distToTarget) * speed,
      y: (dy / distToTarget) * speed,
    };

    return {
      desiredVelocity: finalTargetVel,
      activeMode: 'TRAVELLING',
    };
  }
}
