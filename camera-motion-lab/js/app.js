import { SceneEngine } from './engine.js';
import { Timeline } from './timeline.js';
import { MissionSystem } from './missions.js';
import { StoryboardSystem } from './storyboard.js';
import { UIController } from './ui.js';

class App {
  constructor() {
    this.canvas = document.getElementById('sceneCanvas');
    this.engine = new SceneEngine(this.canvas);
    this.timeline = new Timeline();
    this.missions = new MissionSystem();
    this.storyboard = new StoryboardSystem();
    this.ui = new UIController(this);

    this.recState = 'none'; // 'none' | 'recording_start' | 'has_recording'
    this.mode = 'mission';  // 'mission' | 'free'
    this.lastTimestamp = performance.now();

    this.init();
  }

  init() {
    // Window resize handler
    window.addEventListener('resize', () => {
      this.engine.resize();
      this.render();
    });

    // Initial mission load
    this.loadMission(0);

    // Start main render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  loadMission(index) {
    const mission = this.missions.loadMission(index);
    if (!mission) return;

    // Reset recording and timeline
    this.handleResetClick();

    // Setup initial camera state from mission definition
    if (mission.initialCamera) {
      this.engine.camera.setState(mission.initialCamera);
    } else {
      this.engine.camera.reset();
    }

    // Setup character
    if (mission.characterWalk) {
      this.engine.character.setPath(mission.characterWalk);
    } else {
      this.engine.character.setPath([{ x: -3, z: 0 }, { x: 3, z: 0 }]);
    }
    this.engine.character.reset();

    // Sync UI
    this.ui.syncCameraControls();
    this.ui.updateMissionUI(mission, index, this.missions.getProgress());
    this.ui.drawMinimap();
    this.render();
  }

  loadNextMission() {
    if (this.missions.currentMissionIndex < this.missions.missions.length - 1) {
      this.loadMission(this.missions.currentMissionIndex + 1);
    }
  }

  loadPreviousMission() {
    if (this.missions.currentMissionIndex > 0) {
      this.loadMission(this.missions.currentMissionIndex - 1);
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'free') {
      this.missions.enableFreeMode();
    } else {
      this.missions.disableFreeMode();
    }
    this.handleResetClick();
  }

  handleRecClick() {
    const currentCamState = this.engine.camera.getState();

    if (this.recState === 'none' || this.recState === 'has_recording') {
      // Start recording — set keyframe 1
      this.timeline.startRecording(currentCamState);
      this.recState = 'recording_start';
      this.ui.elements.statusText.textContent = 'REC START SET — MOVE CAMERA THEN CLICK REC END';
    } else if (this.recState === 'recording_start') {
      // End recording — set keyframe 2
      this.timeline.stopRecording(currentCamState);
      this.recState = 'has_recording';
      this.ui.elements.statusText.textContent = 'RECORDED — PRESS PLAY TO PREVIEW';
    }

    this.ui.updateTimelineUI(this.recState, 0, '0:00');
    this.ui.drawMinimap();
  }

  handlePlayClick() {
    if (!this.timeline.hasRecording()) return;

    this.engine.isRecording = true;
    this.engine.character.reset();
    if (this.missions.getCurrentMission().characterWalk) {
      this.engine.character.startWalking();
    }

    this.timeline.play(
      // On frame update
      (interpolatedState, progress) => {
        this.engine.camera.setState(interpolatedState);
        this.ui.syncCameraControls();
        const curTime = (progress * this.timeline.duration).toFixed(1);
        this.ui.updateTimelineUI(this.recState, progress, `${curTime}s`);
        this.ui.drawMinimap();
        this.render();
      },
      // On complete
      () => {
        this.engine.isRecording = false;
        this.engine.character.stopWalking();
        this.ui.updateTimelineUI(this.recState, 1, `${this.timeline.duration}s`);
        this.onShotCompleted();
      }
    );
  }

  handleStopClick() {
    this.timeline.stop();
    this.engine.isRecording = false;
    this.engine.character.stopWalking();
    this.ui.updateTimelineUI(this.recState, 0, '0:00');
    this.render();
  }

  handleResetClick() {
    this.timeline.reset();
    this.recState = 'none';
    this.engine.isRecording = false;
    this.engine.character.reset();

    const currentMission = this.missions.getCurrentMission();
    if (currentMission && currentMission.initialCamera) {
      this.engine.camera.setState(currentMission.initialCamera);
    } else {
      this.engine.camera.reset();
    }

    this.ui.syncCameraControls();
    this.ui.updateTimelineUI('none', 0, '0:00');
    this.ui.elements.statusText.textContent = 'SETUP MODE';
    this.ui.drawMinimap();
    this.render();
  }

  applyMovementPreset(type) {
    const cam = this.engine.camera;
    switch (type) {
      case 'pan':
        cam.panBy(30);
        break;
      case 'tilt':
        cam.tiltBy(20);
        break;
      case 'dolly':
        cam.dollyBy(-2.0);
        break;
      case 'truck':
        cam.truckBy(2.0);
        break;
      case 'pedestal':
        cam.pedestalBy(1.0);
        break;
      case 'tracking':
        cam.truckBy(3.0);
        cam.lookAt(this.engine.character.x, this.engine.character.y + 1, this.engine.character.z);
        break;
      case 'zoom':
        cam.zoomTo(cam.focalLength >= 85 ? 24 : 85);
        break;
    }
  }

  onShotCompleted() {
    const analysis = this.timeline.getMovementAnalysis();
    const evalResult = this.missions.evaluateAttempt(
      analysis,
      this.timeline.startKeyframe,
      this.timeline.endKeyframe
    );

    // Capture thumbnail from canvas
    const frameDataURL = this.engine.captureFrame();

    // Add to storyboard
    const currentMission = this.missions.getCurrentMission();
    this.storyboard.generateCard({
      frameDataURL,
      shotNumber: `SHOT 0${this.missions.currentMissionIndex + 1}`,
      shotSize: this.engine.camera.getShotSizeName(),
      cameraAngle: this.engine.camera.getAngleName(),
      movementType: evalResult.title || 'Custom Shot',
      movementDirection: analysis.primaryMovement?.direction || 'Static',
      description: currentMission.objective,
      missionTitle: currentMission.title,
      stars: evalResult.stars,
    });

    this.ui.updateStoryboardStrip(this.storyboard);

    // Show feedback modal if in mission mode
    if (!this.missions.freeMode) {
      this.ui.showFeedbackModal(evalResult);
      this.ui.updateMissionUI(
        currentMission,
        this.missions.currentMissionIndex,
        this.missions.getProgress()
      );
    }
  }

  loop(timestamp) {
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Update character animation if walking or idle
    this.engine.character.update(deltaTime);

    // Render scene canvas
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    this.engine.render();
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
