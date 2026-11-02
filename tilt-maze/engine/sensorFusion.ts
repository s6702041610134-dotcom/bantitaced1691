import { SensorReading, Vector2D } from './types';

export class SensorFusionEngine {
  private alpha: number;             // Weight for gyroscope (typically 0.80 - 0.90)
  private estimatedPitch: number;    // X tilt (forward/back) in radians
  private estimatedRoll: number;     // Y tilt (left/right) in radians
  private lastTimestamp: number;
  private calibOffsetX: number;
  private calibOffsetY: number;
  private deadzone: number;

  constructor(alpha = 0.85, deadzone = 0.02) {
    this.alpha = alpha;
    this.deadzone = deadzone;
    this.estimatedPitch = 0;
    this.estimatedRoll = 0;
    this.lastTimestamp = Date.now();
    this.calibOffsetX = 0;
    this.calibOffsetY = 0;
  }

  public setAlpha(newAlpha: number) {
    this.alpha = Math.max(0.1, Math.min(0.99, newAlpha));
  }

  public setCalibrationOffset(offset: Vector2D) {
    this.calibOffsetX = offset.x;
    this.calibOffsetY = offset.y;
  }

  public getCalibrationOffset(): Vector2D {
    return { x: this.calibOffsetX, y: this.calibOffsetY };
  }

  public calibrateCurrentAsNeutral() {
    this.calibOffsetX = this.estimatedRoll;
    this.calibOffsetY = this.estimatedPitch;
    return { x: this.calibOffsetX, y: this.calibOffsetY };
  }

  public reset() {
    this.estimatedPitch = 0;
    this.estimatedRoll = 0;
    this.lastTimestamp = Date.now();
  }

  /**
   * Update the filter with current Accelerometer and Gyroscope readings.
   * In mobile portrait orientation:
   * accel.x: left (-) to right (+)
   * accel.y: bottom (-) to top (+)
   * accel.z: into screen (-) to out of screen (+)
   * 
   * gyro.x: pitch rate (around X axis)
   * gyro.y: roll rate (around Y axis)
   * gyro.z: yaw rate (around Z axis)
   */
  public update(
    accel: SensorReading,
    gyro: SensorReading,
    sensitivity = 1.2
  ): Vector2D {
    const now = Date.now();
    let dt = (now - this.lastTimestamp) / 1000.0;
    this.lastTimestamp = now;

    // Safety guard for unexpected pauses / tab switches
    if (dt > 0.1 || dt <= 0) {
      dt = 0.016; // default to ~60hz dt
    }

    // 1. Calculate tilt angle from gravity vector (Accelerometer)
    // When tilted right, accel.x is positive.
    // When tilted top away (forward), accel.y is negative.
    const accelRoll = Math.atan2(accel.x, Math.sqrt(accel.y * accel.y + accel.z * accel.z));
    const accelPitch = Math.atan2(-accel.y, Math.sqrt(accel.x * accel.x + accel.z * accel.z));

    // 2. Complementary Filter Formula:
    // angle = alpha * (angle + gyroRate * dt) + (1 - alpha) * accelAngle
    // gyro.y controls roll (around Y), gyro.x controls pitch (around X)
    this.estimatedRoll =
      this.alpha * (this.estimatedRoll + gyro.y * dt) + (1.0 - this.alpha) * accelRoll;

    this.estimatedPitch =
      this.alpha * (this.estimatedPitch + gyro.x * dt) + (1.0 - this.alpha) * accelPitch;

    // 3. Subtract calibration offset
    let unscaledRoll = this.estimatedRoll - this.calibOffsetX;
    let unscaledPitch = this.estimatedPitch - this.calibOffsetY;

    // 4. Apply Deadzone
    if (Math.abs(unscaledRoll) < this.deadzone) unscaledRoll = 0;
    if (Math.abs(unscaledPitch) < this.deadzone) unscaledPitch = 0;

    // 5. Apply Sensitivity and clamp within playable limits (-0.8 to +0.8 rad ~= +-45 deg)
    const MAX_TILT = 0.8;
    const finalRoll = Math.max(-MAX_TILT, Math.min(MAX_TILT, unscaledRoll * sensitivity));
    const finalPitch = Math.max(-MAX_TILT, Math.min(MAX_TILT, unscaledPitch * sensitivity));

    return {
      x: finalRoll,   // X axis movement on screen (left/right tilt)
      y: finalPitch,  // Y axis movement on screen (forward/backward tilt)
    };
  }
}
