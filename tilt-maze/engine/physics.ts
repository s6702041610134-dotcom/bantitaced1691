import { Vector2D, LevelDefinition, HoleHazard, CollectibleItem, MovingHazard, DoorObstacle } from './types';

export interface PhysicsBallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isFalling: boolean;
  fallProgress: number; // 0 to 1 for visual scale down into hole
}

export interface PhysicsCollisionEvent {
  type: 'WALL' | 'HOLE' | 'STAR' | 'KEY' | 'GOAL' | 'HAZARD';
  intensity: number;
  item?: CollectibleItem;
  hole?: HoleHazard;
}

export class PhysicsEngine {
  // Snappy, responsive gravity & smooth rolling physics
  private gravity: number = 1600;        // pixels / s^2 (crisp & responsive tilt — increased for faster reaction)
  private friction: number = 0.988;     // slightly more rolling resistance for controlled feel
  private bounceRestitution: number = 0.22; // bounce dampening on wall hits
  private maxVelocity: number = 650;    // higher cap so ball doesn't feel sluggish at high tilt

  constructor() {}

  /**
   * Main Physics Tick
   */
  public update(
    ball: PhysicsBallState,
    tilt: Vector2D,
    level: LevelDefinition,
    cellSize: number,
    dt: number
  ): PhysicsCollisionEvent[] {
    const events: PhysicsCollisionEvent[] = [];

    if (ball.isFalling) {
      ball.fallProgress = Math.min(1, ball.fallProgress + dt * 2.5);
      ball.vx *= 0.75;
      ball.vy *= 0.75;
      return events;
    }

    // 1. Apply Tilt as Simulated Gravity Force
    // tilt.x: roll (-1 to 1) -> moves right when positive
    // tilt.y: pitch (-1 to 1) -> moves down when positive
    const ax = tilt.x * this.gravity;
    const ay = tilt.y * this.gravity;

    ball.vx += ax * dt;
    ball.vy += ay * dt;

    // 2. Apply Friction & Rolling Resistance (frame-rate independent)
    const damping = Math.pow(this.friction, dt * 60);
    ball.vx *= damping;
    ball.vy *= damping;

    // 3. Clamp Max Speed
    const speed = Math.hypot(ball.vx, ball.vy);
    if (speed > this.maxVelocity) {
      ball.vx = (ball.vx / speed) * this.maxVelocity;
      ball.vy = (ball.vy / speed) * this.maxVelocity;
    }

    // 4. Update Position Candidate
    let nextX = ball.x + ball.vx * dt;
    let nextY = ball.y + ball.vy * dt;

    // 5. Check Hole Vortex Attraction & Falls
    for (const hole of level.holes) {
      const holeCenterX = (hole.gridX + 0.5) * cellSize;
      const holeCenterY = (hole.gridY + 0.5) * cellSize;
      const holeRadius = hole.radius * cellSize * 0.45;

      const dx = holeCenterX - nextX;
      const dy = holeCenterY - nextY;
      const dist = Math.hypot(dx, dy);

      // Vortex suction effect when near hole
      const suctionRadius = holeRadius * 2.0;
      if (dist < suctionRadius && dist > 0.001) {
        const pullStrength = (1 - dist / suctionRadius) * 220 * dt;
        ball.vx += (dx / dist) * pullStrength;
        ball.vy += (dy / dist) * pullStrength;
      }

      // Fall threshold
      if (dist < holeRadius * 0.6) {
        ball.isFalling = true;
        ball.fallProgress = 0;
        ball.x = holeCenterX;
        ball.y = holeCenterY;
        events.push({ type: 'HOLE', intensity: 1.0, hole });
        return events;
      }
    }

    // 6. Check Wall & Door Collisions with Smooth Sliding
    ball.x = nextX;
    ball.y = nextY;
    const wallCollision = this.resolveGridCollisions(
      ball,
      level,
      cellSize
    );

    if (wallCollision.collided) {
      events.push({
        type: 'WALL',
        intensity: Math.min(1.0, wallCollision.impactSpeed / 200),
      });
    }

    // 7. Check Moving Hazards Collision
    for (const hazard of level.movingHazards) {
      const hazardLeft = hazard.currentX * cellSize;
      const hazardTop = hazard.currentY * cellSize;
      const hazardRight = hazardLeft + hazard.width * cellSize;
      const hazardBottom = hazardTop + hazard.height * cellSize;

      const closestX = Math.max(hazardLeft, Math.min(ball.x, hazardRight));
      const closestY = Math.max(hazardTop, Math.min(ball.y, hazardBottom));
      const dist = Math.hypot(ball.x - closestX, ball.y - closestY);

      if (dist < ball.radius) {
        // Impact with moving hazard
        ball.vx *= -1.2;
        ball.vy *= -1.2;
        events.push({ type: 'HAZARD', intensity: 0.8 });
      }
    }

    // 8. Check Collectibles (Stars, Keys)
    for (const item of level.collectibles) {
      if (item.collected) continue;

      const itemCenterX = (item.gridX + 0.5) * cellSize;
      const itemCenterY = (item.gridY + 0.5) * cellSize;
      const dist = Math.hypot(ball.x - itemCenterX, ball.y - itemCenterY);

      if (dist < ball.radius + cellSize * 0.35) {
        item.collected = true;
        if (item.type === 'KEY' && item.doorId) {
          // Open associated door
          const door = level.doors.find(d => d.id === item.doorId);
          if (door) door.isOpen = true;
        }
        events.push({
          type: item.type === 'STAR' ? 'STAR' : 'KEY',
          intensity: 0.8,
          item,
        });
      }
    }

    // 9. Check Goal Arrival
    const goalCenterX = (level.goalPos.x + 0.5) * cellSize;
    const goalCenterY = (level.goalPos.y + 0.5) * cellSize;
    const distToGoal = Math.hypot(ball.x - goalCenterX, ball.y - goalCenterY);

    if (distToGoal < ball.radius + cellSize * 0.25) {
      events.push({ type: 'GOAL', intensity: 1.0 });
    }

    return events;
  }

  /**
   * Circle vs AABB Grid Collision Resolution with True Wall Sliding
   */
  private resolveGridCollisions(
    ball: PhysicsBallState,
    level: LevelDefinition,
    cellSize: number
  ): { collided: boolean; impactSpeed: number } {
    let collided = false;
    let maxImpactSpeed = 0;

    const r = ball.radius;
    const rows = level.gridRows;
    const cols = level.gridCols;

    // Scan bounding box around ball
    const minCol = Math.max(0, Math.floor((ball.x - r) / cellSize));
    const maxCol = Math.min(cols - 1, Math.floor((ball.x + r) / cellSize));
    const minRow = Math.max(0, Math.floor((ball.y - r) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((ball.y + r) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const isWall = level.grid[row][col] === 1;
        const isClosedDoor = level.doors.some(
          d => !d.isOpen && d.gridX === col && d.gridY === row
        );

        if (!isWall && !isClosedDoor) continue;

        const wallLeft = col * cellSize;
        const wallRight = (col + 1) * cellSize;
        const wallTop = row * cellSize;
        const wallBottom = (row + 1) * cellSize;

        // Closest point on the wall AABB to ball center
        const nearX = Math.max(wallLeft, Math.min(ball.x, wallRight));
        const nearY = Math.max(wallTop, Math.min(ball.y, wallBottom));

        const dx = ball.x - nearX;
        const dy = ball.y - nearY;
        const dist = Math.hypot(dx, dy);

        if (dist < r && dist > 0.0001) {
          collided = true;
          const overlap = r - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push ball out along collision normal
          ball.x += nx * overlap;
          ball.y += ny * overlap;

          // Velocity component along normal
          const vDotN = ball.vx * nx + ball.vy * ny;

          if (vDotN < 0) {
            maxImpactSpeed = Math.max(maxImpactSpeed, Math.abs(vDotN));

            // Elastic bounce along normal only — tangential sliding speed is PRESERVED!
            ball.vx -= (1 + this.bounceRestitution) * vDotN * nx;
            ball.vy -= (1 + this.bounceRestitution) * vDotN * ny;

            // Slight wall friction on the sliding component (0.985)
            ball.vx *= 0.985;
            ball.vy *= 0.985;
          }
        } else if (dist === 0) {
          // Ball center ended up inside the wall block — push to nearest edge
          const distToLeft = ball.x - wallLeft;
          const distToRight = wallRight - ball.x;
          const distToTop = ball.y - wallTop;
          const distToBottom = wallBottom - ball.y;

          const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
          collided = true;

          if (minDist === distToLeft) {
            ball.x = wallLeft - r;
            if (ball.vx > 0) ball.vx = -ball.vx * this.bounceRestitution;
          } else if (minDist === distToRight) {
            ball.x = wallRight + r;
            if (ball.vx < 0) ball.vx = -ball.vx * this.bounceRestitution;
          } else if (minDist === distToTop) {
            ball.y = wallTop - r;
            if (ball.vy > 0) ball.vy = -ball.vy * this.bounceRestitution;
          } else {
            ball.y = wallBottom + r;
            if (ball.vy < 0) ball.vy = -ball.vy * this.bounceRestitution;
          }
        }
      }
    }

    // Outer boundary containment
    const boardWidth = cols * cellSize;
    const boardHeight = rows * cellSize;
    if (ball.x - r < 0) {
      ball.x = r;
      if (ball.vx < 0) ball.vx = -ball.vx * this.bounceRestitution;
      collided = true;
    } else if (ball.x + r > boardWidth) {
      ball.x = boardWidth - r;
      if (ball.vx > 0) ball.vx = -ball.vx * this.bounceRestitution;
      collided = true;
    }

    if (ball.y - r < 0) {
      ball.y = r;
      if (ball.vy < 0) ball.vy = -ball.vy * this.bounceRestitution;
      collided = true;
    } else if (ball.y + r > boardHeight) {
      ball.y = boardHeight - r;
      if (ball.vy > 0) ball.vy = -ball.vy * this.bounceRestitution;
      collided = true;
    }

    return { collided, impactSpeed: maxImpactSpeed };
  }

  /**
   * Update moving hazards positions
   */
  public updateHazards(hazards: MovingHazard[], dt: number) {
    for (const h of hazards) {
      const totalDx = h.endGridX - h.startGridX;
      const totalDy = h.endGridY - h.startGridY;
      const dist = Math.hypot(totalDx, totalDy);
      if (dist === 0) continue;

      const step = (h.speed * dt * h.direction) / dist;
      let progress = (h.currentX - h.startGridX) / (totalDx || 1);

      progress += step;
      if (progress >= 1) {
        progress = 1;
        h.direction = -1;
      } else if (progress <= 0) {
        progress = 0;
        h.direction = 1;
      }

      h.currentX = h.startGridX + totalDx * progress;
      h.currentY = h.startGridY + totalDy * progress;
    }
  }
}
