export class Camera {
  constructor(x = 0, y = 1.6, z = 5, pan = 0, tilt = 0, focalLength = 35) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.pan = pan;
    this.tilt = tilt;
    this.focalLength = focalLength;
  }

  panBy(degrees) {
    this.pan += degrees;
    while (this.pan > 180) this.pan -= 360;
    while (this.pan < -180) this.pan += 360;
  }

  tiltBy(degrees) {
    this.tilt = Math.max(-80, Math.min(80, this.tilt + degrees));
  }

  dollyBy(distance) {
    const rad = (this.pan * Math.PI) / 180;
    const dx = Math.sin(-rad);
    const dz = -Math.cos(-rad);
    this.x += dx * distance;
    this.z += dz * distance;
  }

  truckBy(distance) {
    const rad = (this.pan * Math.PI) / 180;
    const dx = Math.cos(-rad);
    const dz = Math.sin(-rad);
    this.x += dx * distance;
    this.z += dz * distance;
  }

  pedestalBy(distance) {
    this.y += distance;
  }

  zoomTo(focalLength) {
    this.focalLength = Math.max(10, Math.min(300, focalLength));
  }

  lookAt(targetX, targetY, targetZ) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dz = targetZ - this.z;
    const distXZ = Math.sqrt(dx * dx + dz * dz);

    this.pan = (Math.atan2(-dx, -dz) * 180) / Math.PI;
    this.tilt = (Math.atan2(dy, distXZ) * 180) / Math.PI;
  }

  setShotSize(size) {
    if (size === 'wide') this.focalLength = 18;
    else if (size === 'medium') this.focalLength = 35;
    else if (size === 'closeup') this.focalLength = 85;
  }

  setAngle(angle) {
    if (angle === 'high') {
      this.tilt = -25;
      this.y = 2.5;
    } else if (angle === 'eye') {
      this.tilt = 0;
      this.y = 1.6;
    } else if (angle === 'low') {
      this.tilt = 25;
      this.y = 0.5;
    }
  }

  getState() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      pan: this.pan,
      tilt: this.tilt,
      focalLength: this.focalLength
    };
  }

  setState(state) {
    this.x = state.x;
    this.y = state.y;
    this.z = state.z;
    this.pan = state.pan;
    this.tilt = state.tilt;
    this.focalLength = state.focalLength;
  }

  clone() {
    return new Camera(
      this.x,
      this.y,
      this.z,
      this.pan,
      this.tilt,
      this.focalLength
    );
  }

  reset() {
    this.x = 0;
    this.y = 1.6;
    this.z = 5;
    this.pan = 0;
    this.tilt = 0;
    this.focalLength = 35;
  }

  getFOV() {
    return (2 * Math.atan(36 / (2 * this.focalLength)) * 180) / Math.PI;
  }

  getLookDirection() {
    const panRad = (this.pan * Math.PI) / 180;
    const tiltRad = (this.tilt * Math.PI) / 180;

    const dx = Math.sin(-panRad) * Math.cos(tiltRad);
    const dy = Math.sin(tiltRad);
    const dz = -Math.cos(-panRad) * Math.cos(tiltRad);

    return { dx, dy, dz };
  }

  getShotSizeName() {
    if (this.focalLength <= 24) return 'Wide Shot';
    if (this.focalLength <= 50) return 'Medium Shot';
    return 'Close-up';
  }

  getAngleName() {
    if (this.tilt > 10) return 'Low Angle';
    if (this.tilt < -10) return 'High Angle';
    return 'Eye Level';
  }
}
