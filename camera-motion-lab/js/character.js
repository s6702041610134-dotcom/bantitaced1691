export class Character {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.facing = 0;
    this.expression = 'neutral';
    this.isWalking = false;
    this.walkProgress = 0;
    this.walkSpeed = 1.0;
    this.animTime = 0;
    this.walkPath = [{ x: -3, z: 0 }, { x: 3, z: 0 }];
    this.reset();
  }

  update(deltaTime) {
    if (this.isWalking && this.walkPath.length >= 2) {
      const p1 = this.walkPath[0];
      const p2 = this.walkPath[1];
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      this.walkProgress += (this.walkSpeed * deltaTime) / dist;
      if (this.walkProgress > 1) {
        this.walkProgress = 0;
        this.walkPath.push(this.walkPath.shift());
      }

      const currentP1 = this.walkPath[0];
      const currentP2 = this.walkPath[1];
      const cdx = currentP2.x - currentP1.x;
      const cdz = currentP2.z - currentP1.z;

      this.x = currentP1.x + cdx * this.walkProgress;
      this.z = currentP1.z + cdz * this.walkProgress;
      
      this.facing = (Math.atan2(cdx, -cdz) * 180) / Math.PI;
      this.animTime += deltaTime;
    } else {
      this.animTime += deltaTime * 0.5;
    }
  }

  startWalking() {
    this.isWalking = true;
  }

  stopWalking() {
    this.isWalking = false;
    this.walkProgress = 0;
  }

  reset() {
    if (this.walkPath.length > 0) {
      this.x = this.walkPath[0].x;
      this.z = this.walkPath[0].z;
    } else {
      this.x = 0;
      this.z = 0;
    }
    this.isWalking = false;
    this.walkProgress = 0;
    this.animTime = 0;
  }

  setPath(waypoints) {
    this.walkPath = waypoints;
    this.reset();
  }

  getBodyParts() {
    const breathe = Math.sin(this.animTime * Math.PI) * 0.015;
    const stride = this.isWalking ? Math.sin(this.animTime * Math.PI * 2.5) : 0;
    
    const rad = (this.facing * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    
    const transform = (lx, ly, lz) => ({
      x: this.x + lx * cos + lz * sin,
      y: this.y + ly,
      z: this.z - lx * sin + lz * cos
    });

    const torso = {
      p1: transform(0, 0.9 + breathe, 0),
      p2: transform(0, 1.5 + breathe, 0),
      width: 0.35,
      type: 'cylinder'
    };

    const head = {
      p: transform(0, 1.6 + breathe, 0),
      radius: 0.12,
      type: 'sphere'
    };

    const armSwing = stride * 0.35;
    const leftArm = {
      p1: transform(-0.22, 1.4 + breathe, 0),
      p2: transform(-0.25, 0.9 + breathe, armSwing),
      width: 0.1,
      type: 'cylinder'
    };
    const rightArm = {
      p1: transform(0.22, 1.4 + breathe, 0),
      p2: transform(0.25, 0.9 + breathe, -armSwing),
      width: 0.1,
      type: 'cylinder'
    };

    const legSwing = stride * 0.45;
    const leftLeg = {
      p1: transform(-0.1, 0.9, 0),
      p2: transform(-0.1, 0.05, -legSwing),
      width: 0.14,
      type: 'cylinder'
    };
    const rightLeg = {
      p1: transform(0.1, 0.9, 0),
      p2: transform(0.1, 0.05, legSwing),
      width: 0.14,
      type: 'cylinder'
    };

    return { head, torso, leftArm, rightArm, leftLeg, rightLeg };
  }
}
