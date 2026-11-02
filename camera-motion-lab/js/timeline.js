/**
 * Timeline module for handling keyframe recording, playback, and movement analysis.
 */

export class Timeline {
  constructor() {
    /** @type {Object|null} */
    this.startKeyframe = null;
    
    /** @type {Object|null} */
    this.endKeyframe = null;
    
    /** @type {number} */
    this.duration = 3;
    
    /** @type {number} */
    this.speed = 1;
    
    /** @type {boolean} */
    this.isRecording = false;
    
    /** @type {boolean} */
    this.isPlaying = false;
    
    /** @type {number} */
    this.currentTime = 0;
    
    /** @type {number} */
    this.progress = 0;

    this._animationFrameId = null;
    this._lastTimestamp = null;
    this._onFrameCallback = null;
    this._onCompleteCallback = null;
    
    this._loop = this._loop.bind(this);
  }

  /**
   * Starts recording and saves the starting keyframe.
   * @param {Object} cameraState - The current camera state.
   */
  startRecording(cameraState) {
    this.startKeyframe = { ...cameraState };
    this.endKeyframe = null;
    this.isRecording = true;
  }

  /**
   * Stops recording and saves the ending keyframe.
   * @param {Object} cameraState - The final camera state.
   */
  stopRecording(cameraState) {
    this.endKeyframe = { ...cameraState };
    this.isRecording = false;
  }

  /**
   * Checks if a full recording (start and end keyframes) is available.
   * @returns {boolean} True if both start and end keyframes exist.
   */
  hasRecording() {
    return this.startKeyframe !== null && this.endKeyframe !== null;
  }

  /**
   * Starts playback of the recorded timeline.
   * @param {Function} onFrame - Callback called each frame with (interpolatedState, progress).
   * @param {Function} onComplete - Callback called when playback finishes.
   */
  play(onFrame, onComplete) {
    if (!this.hasRecording()) return;
    
    this.isPlaying = true;
    this._onFrameCallback = onFrame;
    this._onCompleteCallback = onComplete;
    this._lastTimestamp = performance.now();
    
    if (this.progress >= 1) {
      this.currentTime = 0;
      this.progress = 0;
    }
    
    this._animationFrameId = requestAnimationFrame(this._loop);
  }

  /**
   * Pauses the playback.
   */
  pause() {
    this.isPlaying = false;
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  /**
   * Stops playback and resets progress to the beginning.
   */
  stop() {
    this.pause();
    this.currentTime = 0;
    this.progress = 0;
    if (this._onFrameCallback && this.startKeyframe) {
      this._onFrameCallback(this.startKeyframe, 0);
    }
  }

  /**
   * Seeks to a specific progress point in the timeline.
   * @param {number} progress - The progress value from 0 to 1.
   */
  seekTo(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    this.currentTime = this.progress * this.duration;
    if (this._onFrameCallback && this.hasRecording()) {
      this._onFrameCallback(this.getInterpolatedState(this.progress), this.progress);
    }
  }

  /**
   * Calculates the interpolated camera state at a given progress using easeInOut.
   * @param {number} t - The progress from 0 to 1.
   * @returns {Object|null} The interpolated camera state.
   */
  getInterpolatedState(t) {
    if (!this.hasRecording()) return null;

    // Cubic ease-in-out
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    
    const s = this.startKeyframe;
    const e = this.endKeyframe;
    
    return {
      x: s.x + (e.x - s.x) * easeT,
      y: s.y + (e.y - s.y) * easeT,
      z: s.z + (e.z - s.z) * easeT,
      pan: s.pan + (e.pan - s.pan) * easeT,
      tilt: s.tilt + (e.tilt - s.tilt) * easeT,
      focalLength: s.focalLength + (e.focalLength - s.focalLength) * easeT
    };
  }

  /**
   * Internal playback loop.
   * @param {number} timestamp 
   */
  _loop(timestamp) {
    if (!this.isPlaying) return;

    const delta = (timestamp - this._lastTimestamp) / 1000;
    this._lastTimestamp = timestamp;

    this.currentTime += delta * this.speed;
    this.progress = this.currentTime / this.duration;

    if (this.progress >= 1) {
      this.progress = 1;
      this.currentTime = this.duration;
      this.isPlaying = false;
      
      if (this._onFrameCallback) {
        this._onFrameCallback(this.getInterpolatedState(1), 1);
      }
      if (this._onCompleteCallback) {
        this._onCompleteCallback();
      }
      return;
    }

    if (this._onFrameCallback) {
      this._onFrameCallback(this.getInterpolatedState(this.progress), this.progress);
    }

    this._animationFrameId = requestAnimationFrame(this._loop);
  }

  /**
   * Analyzes the movement between the start and end keyframes.
   * @returns {Object} Analysis object containing movement types, distance, rotation, etc.
   */
  getMovementAnalysis() {
    if (!this.hasRecording()) {
      return null;
    }

    const s = this.startKeyframe;
    const e = this.endKeyframe;
    const movements = [];
    
    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const dz = e.z - s.z;
    const dPan = e.pan - s.pan;
    const dTilt = e.tilt - s.tilt;
    const dFocalLength = e.focalLength - s.focalLength;

    const thresholdPos = 0.1;
    const thresholdRot = 1.0;
    const thresholdZoom = 1.0;

    if (Math.abs(dPan) > thresholdRot) {
      movements.push({ type: 'pan', direction: dPan > 0 ? 'right' : 'left', amount: Math.abs(dPan) });
    }
    if (Math.abs(dTilt) > thresholdRot) {
      movements.push({ type: 'tilt', direction: dTilt > 0 ? 'up' : 'down', amount: Math.abs(dTilt) });
    }
    if (Math.abs(dz) > thresholdPos) {
      movements.push({ type: 'dolly', direction: dz < 0 ? 'in' : 'out', amount: Math.abs(dz) });
    }
    if (Math.abs(dx) > thresholdPos) {
      movements.push({ type: 'truck', direction: dx > 0 ? 'right' : 'left', amount: Math.abs(dx) });
    }
    if (Math.abs(dy) > thresholdPos) {
      movements.push({ type: 'pedestal', direction: dy > 0 ? 'up' : 'down', amount: Math.abs(dy) });
    }
    if (Math.abs(dFocalLength) > thresholdZoom) {
      movements.push({ type: 'zoom', direction: dFocalLength > 0 ? 'in' : 'out', amount: Math.abs(dFocalLength) });
    }

    let primaryMovement = null;
    let maxAmount = -1;
    for (const mov of movements) {
      // Normalize amounts to compare them roughly. 1 unit of distance ~ 10 degrees of rotation
      let normalizedAmount = mov.amount;
      if (mov.type === 'pan' || mov.type === 'tilt') normalizedAmount /= 10;
      else if (mov.type === 'zoom') normalizedAmount /= 10;
      
      if (normalizedAmount > maxAmount) {
        maxAmount = normalizedAmount;
        primaryMovement = mov;
      }
    }

    const totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const totalRotation = Math.sqrt(dPan * dPan + dTilt * dTilt);
    const zoomDelta = Math.abs(dFocalLength);

    const speed = totalDistance / (this.duration / this.speed);
    let speedCategory = 'moderate';
    if (speed < 0.5) speedCategory = 'slow';
    else if (speed > 2.0) speedCategory = 'fast';

    return {
      movements,
      primaryMovement,
      totalDistance,
      totalRotation,
      zoomDelta,
      speedCategory
    };
  }

  /**
   * Clears all keyframes.
   */
  reset() {
    this.stop();
    this.startKeyframe = null;
    this.endKeyframe = null;
  }

  /**
   * Sets the timeline duration.
   * @param {number} seconds - The duration in seconds.
   */
  setDuration(seconds) {
    this.duration = Math.max(0.1, seconds);
  }

  /**
   * Sets the playback speed multiplier.
   * @param {number} multiplier - Playback speed multiplier.
   */
  setSpeed(multiplier) {
    this.speed = Math.max(0.1, multiplier);
  }
}
