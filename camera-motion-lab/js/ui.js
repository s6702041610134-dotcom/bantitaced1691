/**
 * UIController — Manages DOM bindings, controls, modals, HUD, and 2D minimap canvas.
 */
export class UIController {
  constructor(app) {
    this.app = app;
    this.elements = {};
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    const ids = [
      'levelBadge', 'missionName', 'progressBar', 'totalStars',
      'missionNumber', 'missionDifficulty', 'missionTitle', 'missionObjective',
      'hintToggle', 'hintText', 'missionConcept', 'btnPrevMission', 'btnNextMission',
      'btnMissionMode', 'btnFreeMode', 'storyboardStrip', 'storyboardEmpty',
      'sceneCanvas', 'sceneStatus', 'statusText',
      'sliderPosX', 'valPosX', 'sliderPosY', 'valPosY', 'sliderPosZ', 'valPosZ',
      'sliderPan', 'valPan', 'sliderTilt', 'valTilt',
      'sliderZoom', 'valZoom',
      'shotSizeGroup', 'angleGroup', 'movementSelector',
      'sliderSpeed', 'valSpeed', 'sliderDuration', 'valDuration',
      'timeline', 'timelineProgress', 'timelinePlayhead', 'keyframeStart', 'keyframeEnd',
      'timeLabel', 'durationLabel',
      'btnReset', 'btnRec', 'btnPlay', 'btnStop',
      'pathCanvas',
      'feedbackOverlay', 'feedbackTitle', 'feedbackStars',
      'feedbackUsedText', 'feedbackHowText', 'feedbackEffectText', 'feedbackWhenText', 'feedbackTipsText',
      'btnRetry', 'btnNextFromFeedback',
      'briefingOverlay', 'briefingBadge', 'briefingTitle', 'briefingObjective', 'btnStartMission',
      'storyboardOverlay', 'btnCloseStoryboard', 'storyboardGrid'
    ];

    ids.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    // Sub-elements
    if (this.elements.pathCanvas) {
      this.pathCtx = this.elements.pathCanvas.getContext('2d');
    }
  }

  bindEvents() {
    const el = this.elements;

    // Sliders — Camera Position
    el.sliderPosX?.addEventListener('input', (e) => {
      this.app.engine.camera.x = parseFloat(e.target.value);
      this.updateValueDisplay('valPosX', e.target.value);
      this.app.render();
      this.drawMinimap();
    });

    el.sliderPosY?.addEventListener('input', (e) => {
      this.app.engine.camera.y = parseFloat(e.target.value);
      this.updateValueDisplay('valPosY', e.target.value);
      this.app.render();
    });

    el.sliderPosZ?.addEventListener('input', (e) => {
      this.app.engine.camera.z = parseFloat(e.target.value);
      this.updateValueDisplay('valPosZ', e.target.value);
      this.app.render();
      this.drawMinimap();
    });

    // Rotation
    el.sliderPan?.addEventListener('input', (e) => {
      this.app.engine.camera.pan = parseFloat(e.target.value);
      this.updateValueDisplay('valPan', `${e.target.value}°`);
      this.app.render();
      this.drawMinimap();
    });

    el.sliderTilt?.addEventListener('input', (e) => {
      this.app.engine.camera.tilt = parseFloat(e.target.value);
      this.updateValueDisplay('valTilt', `${e.target.value}°`);
      this.app.render();
    });

    // Zoom
    el.sliderZoom?.addEventListener('input', (e) => {
      this.app.engine.camera.focalLength = parseFloat(e.target.value);
      this.updateValueDisplay('valZoom', `${e.target.value}mm`);
      this.updateShotSizeRadio(this.app.engine.camera.getShotSizeName());
      this.app.render();
    });

    // Shot Size Radio Buttons
    el.shotSizeGroup?.querySelectorAll('.radio-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.value;
        this.app.engine.camera.setShotSize(size);
        this.syncCameraControls();
        this.app.render();
      });
    });

    // Angle Radio Buttons
    el.angleGroup?.querySelectorAll('.radio-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const angle = btn.dataset.value;
        this.app.engine.camera.setAngle(angle);
        this.syncCameraControls();
        this.app.render();
        this.drawMinimap();
      });
    });

    // Movement Type Preset Buttons
    el.movementSelector?.querySelectorAll('.movement-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.movement;
        this.app.applyMovementPreset(type);
        this.syncCameraControls();
        this.app.render();
        this.drawMinimap();
      });
    });

    // Speed & Duration
    el.sliderSpeed?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.app.timeline.setSpeed(val);
      this.updateValueDisplay('valSpeed', `${val}x`);
    });

    el.sliderDuration?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.app.timeline.setDuration(val);
      this.updateValueDisplay('valDuration', `${val}s`);
      if (el.durationLabel) el.durationLabel.textContent = `/ ${val}:00`;
    });

    // Transport Controls
    el.btnRec?.addEventListener('click', () => {
      this.app.handleRecClick();
    });

    el.btnPlay?.addEventListener('click', () => {
      this.app.handlePlayClick();
    });

    el.btnStop?.addEventListener('click', () => {
      this.app.handleStopClick();
    });

    el.btnReset?.addEventListener('click', () => {
      this.app.handleResetClick();
    });

    // Hint Toggle
    el.hintToggle?.addEventListener('click', () => {
      el.hintText?.classList.toggle('hidden');
      const isHidden = el.hintText?.classList.contains('hidden');
      el.hintToggle.innerHTML = isHidden ? '<span>💡</span> Show Hint' : '<span>💡</span> Hide Hint';
    });

    // Navigation
    el.btnPrevMission?.addEventListener('click', () => this.app.loadPreviousMission());
    el.btnNextMission?.addEventListener('click', () => this.app.loadNextMission());

    // Mode Switcher
    el.btnMissionMode?.addEventListener('click', () => {
      this.app.setMode('mission');
      el.btnMissionMode.classList.add('active');
      el.btnFreeMode.classList.remove('active');
    });

    el.btnFreeMode?.addEventListener('click', () => {
      this.app.setMode('free');
      el.btnFreeMode.classList.add('active');
      el.btnMissionMode.classList.remove('active');
    });

    // Modals
    el.btnStartMission?.addEventListener('click', () => {
      this.hideModal('briefingOverlay');
    });

    el.btnRetry?.addEventListener('click', () => {
      this.hideModal('feedbackOverlay');
      this.app.handleResetClick();
    });

    el.btnNextFromFeedback?.addEventListener('click', () => {
      this.hideModal('feedbackOverlay');
      this.app.loadNextMission();
    });

    el.btnCloseStoryboard?.addEventListener('click', () => {
      this.hideModal('storyboardOverlay');
    });

    // Canvas click to focus / camera interaction (drag to pan/tilt)
    let isDragging = false;
    let lastX = 0, lastY = 0;

    el.sceneCanvas?.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      this.app.engine.camera.panBy(dx * 0.3);
      this.app.engine.camera.tiltBy(-dy * 0.3);
      this.syncCameraControls();
      this.app.render();
      this.drawMinimap();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (this.app.timeline.isPlaying) this.app.handleStopClick();
          else if (!el.btnPlay?.disabled) this.app.handlePlayClick();
          break;
        case 'r':
          this.app.handleRecClick();
          break;
        case 'escape':
          this.hideModal('feedbackOverlay');
          this.hideModal('briefingOverlay');
          this.hideModal('storyboardOverlay');
          break;
      }
    });
  }

  updateValueDisplay(id, val) {
    if (this.elements[id]) {
      this.elements[id].textContent = val;
    }
  }

  syncCameraControls() {
    const cam = this.app.engine.camera;
    const el = this.elements;

    if (el.sliderPosX) el.sliderPosX.value = cam.x.toFixed(1);
    if (el.valPosX) el.valPosX.textContent = cam.x.toFixed(1);

    if (el.sliderPosY) el.sliderPosY.value = cam.y.toFixed(1);
    if (el.valPosY) el.valPosY.textContent = cam.y.toFixed(1);

    if (el.sliderPosZ) el.sliderPosZ.value = cam.z.toFixed(1);
    if (el.valPosZ) el.valPosZ.textContent = cam.z.toFixed(1);

    if (el.sliderPan) el.sliderPan.value = Math.round(cam.pan);
    if (el.valPan) el.valPan.textContent = `${Math.round(cam.pan)}°`;

    if (el.sliderTilt) el.sliderTilt.value = Math.round(cam.tilt);
    if (el.valTilt) el.valTilt.textContent = `${Math.round(cam.tilt)}°`;

    if (el.sliderZoom) el.sliderZoom.value = Math.round(cam.focalLength);
    if (el.valZoom) el.valZoom.textContent = `${Math.round(cam.focalLength)}mm`;

    this.updateShotSizeRadio(cam.getShotSizeName());
    this.updateAngleRadio(cam.getAngleName());
  }

  updateShotSizeRadio(sizeName) {
    const group = this.elements.shotSizeGroup;
    if (!group) return;
    group.querySelectorAll('.radio-pill').forEach(btn => {
      const val = btn.dataset.value;
      const isMatch = (val === 'wide' && sizeName === 'Wide Shot') ||
                      (val === 'medium' && sizeName === 'Medium Shot') ||
                      (val === 'closeup' && sizeName === 'Close-up');
      btn.classList.toggle('active', isMatch);
    });
  }

  updateAngleRadio(angleName) {
    const group = this.elements.angleGroup;
    if (!group) return;
    group.querySelectorAll('.radio-pill').forEach(btn => {
      const val = btn.dataset.value;
      const isMatch = (val === 'high' && angleName === 'High Angle') ||
                      (val === 'eye' && angleName === 'Eye Level') ||
                      (val === 'low' && angleName === 'Low Angle');
      btn.classList.toggle('active', isMatch);
    });
  }

  updateMissionUI(mission, index, progress) {
    const el = this.elements;
    if (el.levelBadge) el.levelBadge.textContent = `Level ${index + 1}`;
    if (el.missionName) el.missionName.textContent = `Mission ${index + 1} — ${mission.title}`;
    if (el.missionNumber) el.missionNumber.textContent = String(index + 1).padStart(2, '0');
    if (el.missionTitle) el.missionTitle.textContent = mission.title;
    if (el.missionObjective) el.missionObjective.textContent = `"${mission.objective}"`;
    if (el.hintText) {
      el.hintText.textContent = mission.hint;
      el.hintText.classList.add('hidden');
    }
    if (el.hintToggle) el.hintToggle.innerHTML = '<span>💡</span> Show Hint';

    // Difficulty stars
    if (el.missionDifficulty) {
      let starsHTML = '';
      for (let i = 0; i < 3; i++) {
        starsHTML += `<span class="star ${i < mission.difficulty ? 'filled' : ''}">★</span>`;
      }
      el.missionDifficulty.innerHTML = starsHTML;
    }

    // Concept tag
    if (el.missionConcept) {
      el.missionConcept.classList.add('hidden');
      el.missionConcept.querySelector('.concept-tag').textContent = `Expected: ${mission.expectedMovement}`;
    }

    // Navigation buttons
    if (el.btnPrevMission) el.btnPrevMission.disabled = index === 0;
    if (el.btnNextMission) el.btnNextMission.disabled = index >= progress.total - 1 || !this.app.missions.isUnlocked(index + 1);

    // Progress bar
    if (el.progressBar) {
      const segments = el.progressBar.querySelectorAll('.progress-bar__segment');
      segments.forEach((seg, i) => {
        seg.classList.toggle('filled', i <= index);
        seg.classList.toggle('active', i === index);
      });
    }

    // Total stars
    if (el.totalStars) el.totalStars.textContent = progress.stars;

    // Show Briefing Modal
    if (el.briefingBadge) el.briefingBadge.textContent = `Mission ${String(index + 1).padStart(2, '0')}`;
    if (el.briefingTitle) el.briefingTitle.textContent = mission.title;
    if (el.briefingObjective) el.briefingObjective.textContent = `"${mission.objective}"`;
    this.showModal('briefingOverlay');
  }

  updateTimelineUI(recState, progress, timeText) {
    const el = this.elements;

    if (el.timelineProgress) el.timelineProgress.style.width = `${progress * 100}%`;
    if (el.timelinePlayhead) el.timelinePlayhead.style.left = `${progress * 100}%`;
    if (el.timeLabel) el.timeLabel.textContent = timeText;

    // Rec state handling
    if (el.btnRec) {
      if (recState === 'none') {
        el.btnRec.classList.remove('recording', 'active');
        el.btnRec.querySelector('.rec-label').textContent = 'REC';
        el.keyframeStart?.classList.add('hidden');
        el.keyframeEnd?.classList.add('hidden');
        if (el.btnPlay) el.btnPlay.disabled = true;
      } else if (recState === 'recording_start') {
        el.btnRec.classList.add('recording', 'active');
        el.btnRec.querySelector('.rec-label').textContent = 'REC END';
        el.keyframeStart?.classList.remove('hidden');
        el.keyframeStart.style.left = '0%';
        if (el.btnPlay) el.btnPlay.disabled = true;
      } else if (recState === 'has_recording') {
        el.btnRec.classList.remove('recording');
        el.btnRec.classList.add('active');
        el.btnRec.querySelector('.rec-label').textContent = 'REC AGAIN';
        el.keyframeStart?.classList.remove('hidden');
        el.keyframeEnd?.classList.remove('hidden');
        if (el.btnPlay) el.btnPlay.disabled = false;
      }
    }
  }

  showFeedbackModal(evalResult) {
    const el = this.elements;
    if (el.feedbackTitle) el.feedbackTitle.textContent = evalResult.passed ? `${evalResult.title} Complete!` : 'Try Again!';
    
    // Stars
    if (el.feedbackStars) {
      let starsHTML = '';
      for (let i = 0; i < 3; i++) {
        starsHTML += `<span class="star-large ${i < evalResult.stars ? 'filled' : ''}">★</span>`;
      }
      el.feedbackStars.innerHTML = starsHTML;
    }

    if (el.feedbackUsedText) el.feedbackUsedText.textContent = evalResult.whatWasUsed;
    if (el.feedbackHowText) el.feedbackHowText.textContent = evalResult.howItMoved;
    if (el.feedbackEffectText) el.feedbackEffectText.textContent = evalResult.visualEffect;
    if (el.feedbackWhenText) el.feedbackWhenText.textContent = evalResult.whenUseful;
    if (el.feedbackTipsText) el.feedbackTipsText.textContent = evalResult.tips;

    this.showModal('feedbackOverlay');
  }

  showModal(id) {
    if (this.elements[id]) {
      this.elements[id].classList.remove('hidden');
    }
  }

  hideModal(id) {
    if (this.elements[id]) {
      this.elements[id].classList.add('hidden');
    }
  }

  updateStoryboardStrip(storyboardSystem) {
    const el = this.elements;
    if (!el.storyboardStrip) return;

    const cards = storyboardSystem.getCards();
    if (cards.length === 0) {
      if (el.storyboardEmpty) el.storyboardEmpty.classList.remove('hidden');
      return;
    }

    if (el.storyboardEmpty) el.storyboardEmpty.classList.add('hidden');
    el.storyboardStrip.innerHTML = storyboardSystem.renderStripHTML();
  }

  drawMinimap() {
    const ctx = this.pathCtx;
    if (!ctx) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#161B22';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(240, 246, 252, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // World bounds mapping (X: -8 to 8 -> 10 to 130, Z: -5 to 10 -> 90 to 10)
    const mapX = (x) => 70 + (x / 8) * 55;
    const mapZ = (z) => 50 + (z / 10) * 40;

    // Subject (Character) at origin
    const char = this.app.engine.character;
    const cx = mapX(char ? char.x : 0);
    const cz = mapZ(char ? char.z : 0);

    ctx.fillStyle = '#58A6FF';
    ctx.beginPath();
    ctx.arc(cx, cz, 4, 0, Math.PI * 2);
    ctx.fill();

    // Camera
    const cam = this.app.engine.camera;
    const camX = mapX(cam.x);
    const camZ = mapZ(cam.z);

    // Camera FOV cone
    const rad = (cam.pan - 90) * (Math.PI / 180);
    const fovRad = (cam.getFOV() * Math.PI) / 180;
    const coneLen = 25;

    ctx.fillStyle = 'rgba(88, 166, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(camX, camZ);
    ctx.arc(camX, camZ, coneLen, rad - fovRad / 2, rad + fovRad / 2);
    ctx.closePath();
    ctx.fill();

    // Camera Icon (Dot + Direction Line)
    ctx.fillStyle = '#3FB950';
    ctx.beginPath();
    ctx.arc(camX, camZ, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3FB950';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(camX, camZ);
    ctx.lineTo(camX + Math.cos(rad) * 12, camZ + Math.sin(rad) * 12);
    ctx.stroke();

    // Keyframe Path if recording exists
    const timeline = this.app.timeline;
    if (timeline && timeline.startKeyframe && timeline.endKeyframe) {
      const k1X = mapX(timeline.startKeyframe.x);
      const k1Z = mapZ(timeline.startKeyframe.z);
      const k2X = mapX(timeline.endKeyframe.x);
      const k2Z = mapZ(timeline.endKeyframe.z);

      ctx.strokeStyle = '#F0883E';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(k1X, k1Z);
      ctx.lineTo(k2X, k2Z);
      ctx.stroke();
      ctx.setLineDash([]);

      // Start dot
      ctx.fillStyle = '#F0883E';
      ctx.beginPath(); ctx.arc(k1X, k1Z, 3, 0, Math.PI * 2); ctx.fill();
      // End dot
      ctx.fillStyle = '#BC8CFF';
      ctx.beginPath(); ctx.arc(k2X, k2Z, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}
