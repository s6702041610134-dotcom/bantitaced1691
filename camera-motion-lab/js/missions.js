/**
 * Mission system for handling progressive challenges and educational feedback.
 */

export class MissionSystem {
  constructor() {
    /** @type {number} */
    this.currentMissionIndex = 0;
    
    /** @type {Map<number, Object>} */
    this.completedMissions = new Map();
    
    /** @type {number} */
    this.totalStars = 0;
    
    /** @type {boolean} */
    this.freeMode = false;

    this.missions = [
      {
        title: "The Walking Shot",
        difficulty: 1, // ⭐ Beginner
        objective: "Follow the character as they walk from left to right.",
        hint: "Think about how the camera should move to keep the character in frame.",
        setup: {
          characterStart: { x: -3, y: 0, z: 0 },
          characterEnd: { x: 3, y: 0, z: 0 },
          cameraStart: { x: 0, y: 1.6, z: 5, pan: 0, tilt: 0, focalLength: 35 }
        }
      },
      {
        title: "Emotional Close-up",
        difficulty: 1, // ⭐ Beginner
        objective: "Gradually approach the character to emphasize their emotion.",
        hint: "How can you make the audience focus more intensely on the character?",
        setup: {
          characterStart: { x: 0, y: 0, z: 0 },
          cameraStart: { x: 0, y: 1.6, z: 6, pan: 0, tilt: 0, focalLength: 35 }
        }
      },
      {
        title: "The Reveal",
        difficulty: 2, // ⭐⭐ Intermediate
        objective: "Start looking at the character, then slowly reveal what is behind them.",
        hint: "Sometimes the most powerful shots show what the character cannot see.",
        setup: {
          characterStart: { x: 0, y: 0, z: 0 },
          cameraStart: { x: 0, y: 1.6, z: 4, pan: 0, tilt: 0, focalLength: 35 }
        }
      },
      {
        title: "Power Shot",
        difficulty: 2, // ⭐⭐ Intermediate
        objective: "Make the character appear powerful and dominant.",
        hint: "Where you place the camera relative to the character affects how the audience perceives them.",
        setup: {
          characterStart: { x: 0, y: 0, z: 0 },
          cameraStart: { x: 0, y: 1.6, z: 4, pan: 0, tilt: 0, focalLength: 35 }
        }
      },
      {
        title: "Tension Builder",
        difficulty: 3, // ⭐⭐⭐ Advanced
        objective: "Create tension by slowly revealing the scene. Start with a detail, then show the full environment.",
        hint: "Sometimes holding back information creates suspense. Think about pacing.",
        setup: {
          characterStart: { x: 0, y: 0, z: 0 },
          cameraStart: { x: 0, y: 1.6, z: 1.5, pan: 0, tilt: 0, focalLength: 85 }
        }
      }
    ];
  }

  /**
   * Retrieves the current mission definition.
   * @returns {Object} The current mission object.
   */
  getCurrentMission() {
    return this.missions[this.currentMissionIndex];
  }

  /**
   * Loads a specific mission if it is unlocked.
   * @param {number} index - The mission index to load.
   */
  loadMission(index) {
    if (this.isUnlocked(index)) {
      this.currentMissionIndex = index;
    }
  }

  /**
   * Advances to the next mission if unlocked.
   */
  nextMission() {
    if (this.currentMissionIndex < this.missions.length - 1 && this.isUnlocked(this.currentMissionIndex + 1)) {
      this.currentMissionIndex++;
    }
  }

  /**
   * Goes back to the previous mission.
   */
  previousMission() {
    if (this.currentMissionIndex > 0) {
      this.currentMissionIndex--;
    }
  }

  /**
   * Checks if a given mission index is unlocked.
   * @param {number} index - The mission index.
   * @returns {boolean} True if unlocked.
   */
  isUnlocked(index) {
    if (index === 0) return true;
    return this.completedMissions.has(index - 1) && this.completedMissions.get(index - 1).stars > 0;
  }

  /**
   * Evaluates the recorded attempt against the current mission's requirements.
   * @param {Object} movementAnalysis - Analysis object from the Timeline module.
   * @param {Object} startState - The camera's initial state.
   * @param {Object} endState - The camera's final state.
   * @returns {Object} Evaluation result and feedback.
   */
  evaluateAttempt(movementAnalysis, startState, endState) {
    if (this.freeMode) {
      return {
        stars: 3,
        passed: true,
        title: "Free Mode",
        feedback: "Great practice! Experimentation is key to mastering camera movement.",
        whatWasUsed: "Various movements",
        howItMoved: "The camera moved freely based on your input.",
        visualEffect: "Unique to your creative vision.",
        whenUseful: "Practicing complex combinations and discovering new techniques.",
        tips: "Try applying what you learned here to specific storytelling goals."
      };
    }

    const mission = this.getCurrentMission();
    let result = {
      stars: 0,
      passed: false,
      title: "Attempt Evaluation",
      feedback: "",
      whatWasUsed: "",
      howItMoved: "",
      visualEffect: "",
      whenUseful: "",
      tips: ""
    };

    const hasMovementType = (type, direction = null) => {
      return movementAnalysis.movements.find(m => m.type === type && (!direction || m.direction === direction));
    };

    switch (this.currentMissionIndex) {
      case 0: // The Walking Shot
        {
          const truckRight = hasMovementType('truck', 'right');
          const panRight = hasMovementType('pan', 'right');
          
          if (truckRight && truckRight.amount > 2) {
            result.stars = 3;
            result.passed = true;
            result.feedback = "Excellent tracking shot! You followed the subject smoothly using physical camera movement.";
            result.whatWasUsed = "Tracking / Truck Right";
            result.howItMoved = "The camera physically moved sideways to the right, matching the character's movement.";
            result.visualEffect = "Keeps the subject fixed in the frame while the background moves behind them, creating a dynamic connection to their journey.";
            result.whenUseful = "Following a character down a hallway, walking along a street, or emphasizing continuous motion.";
            result.tips = "Keep practicing maintaining consistent speed with your subject.";
          } else if (panRight && panRight.amount > 15) {
            result.stars = 2;
            result.passed = true;
            result.feedback = "Good job keeping the subject in view, but you panned the camera instead of moving it physically.";
            result.whatWasUsed = "Pan Right";
            result.howItMoved = "The camera rotated to the right from a fixed position.";
            result.visualEffect = "Shows a change in perspective from a stationary observer, but feels less immersive than physically tracking the subject.";
            result.whenUseful = "When the camera cannot physically follow, like watching a sports play from the sidelines.";
            result.tips = "Try 'trucking' (moving left/right) instead of just panning to create a true tracking shot.";
          } else {
            result.stars = 1;
            result.passed = false;
            result.feedback = "The camera didn't quite keep up with the character.";
            result.whatWasUsed = movementAnalysis.primaryMovement ? movementAnalysis.primaryMovement.type : "Minimal movement";
            result.howItMoved = "The camera didn't move far enough to the right.";
            result.visualEffect = "The subject slips out of frame, losing audience focus.";
            result.whenUseful = "Only when intentionally wanting a character to leave the scene.";
            result.tips = "Make sure the camera moves consistently to the right to follow the walking character.";
          }
        }
        break;

      case 1: // Emotional Close-up
        {
          const dollyIn = hasMovementType('dolly', 'in');
          const zoomIn = hasMovementType('zoom', 'in');

          if (dollyIn && dollyIn.amount > 2) {
            result.stars = 3;
            result.passed = true;
            result.feedback = "Perfect Dolly In! You brought the audience physically closer to the character.";
            result.whatWasUsed = "Dolly In";
            result.howItMoved = "The camera physical moved forward through 3D space toward the subject.";
            result.visualEffect = "Increases intimacy and emotional connection. The background shifts perspective around the subject (parallax).";
            result.whenUseful = "Crucial dialogue, moments of realization, or intensifying an emotional reaction.";
            result.tips = "Try combining this with a slight downward tilt to make the subject appear more vulnerable.";
          } else if (zoomIn && zoomIn.amount > 15) {
            result.stars = 2;
            result.passed = true;
            result.feedback = "You achieved the close-up by zooming, which flattens the image compared to dollying.";
            result.whatWasUsed = "Zoom In";
            result.howItMoved = "The camera stayed in place while the lens focal length increased, magnifying the image.";
            result.visualEffect = "Magnifies the subject but compresses depth, making the background feel unnaturally close and flat.";
            result.whenUseful = "Documentary style, sudden dramatic realizations (snap zoom), or when physically constrained.";
            result.tips = "Try moving the camera physically forward (Dolly In) instead of changing the focal length (Zoom In) for a more cinematic feel.";
          } else {
            result.stars = 1;
            result.passed = false;
            result.feedback = "The camera didn't get close enough to emphasize the character's emotion.";
            result.whatWasUsed = movementAnalysis.primaryMovement ? movementAnalysis.primaryMovement.type : "Minimal movement";
            result.howItMoved = "The camera stayed too far away or moved incorrectly.";
            result.visualEffect = "Maintains emotional distance from the subject.";
            result.whenUseful = "When observing a subject objectively or emphasizing their isolation in a space.";
            result.tips = "Focus on bringing the camera closer to the character, either by moving forward (Z-axis) or zooming.";
          }
        }
        break;

      case 2: // The Reveal
        {
          const pan = hasMovementType('pan');
          
          if (pan && pan.amount > 30) {
            result.stars = 3;
            result.passed = true;
            result.feedback = "Great reveal! You used panning perfectly to redirect the audience's attention.";
            result.whatWasUsed = "Pan";
            result.howItMoved = "The camera rotated horizontally on a fixed axis to reveal new information.";
            result.visualEffect = "Connects two subjects spatially, establishing their relationship or revealing a surprise.";
            result.whenUseful = "Showing a character's POV, revealing a threat approaching, or establishing a location's geography.";
            result.tips = "Ensure the speed of the pan matches the emotional weight of the reveal.";
          } else if (pan && pan.amount > 10) {
            result.stars = 2;
            result.passed = true;
            result.feedback = "Good start, but the pan could be wider to fully reveal the surrounding context.";
            result.whatWasUsed = "Partial Pan";
            result.howItMoved = "The camera rotated slightly, but didn't completely reframe the scene.";
            result.visualEffect = "Shows some context but might leave the audience wanting to see more.";
            result.whenUseful = "Subtle glances or minor shifts in attention.";
            result.tips = "Pan further to ensure the new focal point is clearly established in the frame.";
          } else {
            result.stars = 1;
            result.passed = false;
            result.feedback = "The camera didn't pan enough to reveal what was hidden.";
            result.whatWasUsed = movementAnalysis.primaryMovement ? movementAnalysis.primaryMovement.type : "Minimal movement";
            result.howItMoved = "The camera mostly stayed focused on the initial subject.";
            result.visualEffect = "Keeps the audience's attention locked on the first subject.";
            result.whenUseful = "When the surrounding environment is unimportant.";
            result.tips = "Rotate the camera horizontally (Pan) significantly to show the space beside the character.";
          }
        }
        break;

      case 3: // Power Shot
        {
          const isLow = endState.y < 1.0;
          const isTiltedUp = endState.tilt > 10;

          if (isLow && isTiltedUp) {
            result.stars = 3;
            result.passed = true;
            result.feedback = "Perfect Low Angle shot! The character looks dominant and imposing.";
            result.whatWasUsed = "Low Angle";
            result.howItMoved = "The camera was lowered (pedestal down) and angled upwards (tilt up) at the subject.";
            result.visualEffect = "Makes the subject appear larger, powerful, heroic, or intimidating. Looming over the audience.";
            result.whenUseful = "Introducing a hero, showing a villain's dominance, or emphasizing scale.";
            result.tips = "Try varying how low you go; extreme low angles can feel unnatural or highly stylized.";
          } else if (isLow || isTiltedUp) {
            result.stars = 2;
            result.passed = true;
            result.feedback = "You got part of the way there, but combining both a low position and an upward tilt is more effective.";
            result.whatWasUsed = isLow ? "Low Position" : "Upward Tilt";
            result.howItMoved = isLow ? "The camera was moved lower but didn't tilt up." : "The camera tilted up but stayed at eye level.";
            result.visualEffect = "Slightly alters perception but lacks the strong psychological impact of a true low angle.";
            result.whenUseful = "Subtle shifts in power dynamics without being overly dramatic.";
            result.tips = "Make sure to both lower the camera height (Y-axis) AND tilt the camera upwards to look at the subject's face.";
          } else {
            result.stars = 1;
            result.passed = false;
            result.feedback = "The camera angle didn't convey power. It felt like a standard eye-level shot.";
            result.whatWasUsed = "Eye Level / High Angle";
            result.howItMoved = "The camera remained high or pointed straight forward/down.";
            result.visualEffect = "Subject appears normal, equal to the viewer, or even weak if shot from above.";
            result.whenUseful = "Neutral observations or making a character seem vulnerable (High Angle).";
            result.tips = "Move the camera physically closer to the ground and tilt it up towards the character.";
          }
        }
        break;

      case 4: // Tension Builder
        {
          const dollyOut = hasMovementType('dolly', 'out');
          const zoomOut = hasMovementType('zoom', 'out');
          const isSlow = movementAnalysis.speedCategory === 'slow';

          if ((dollyOut || zoomOut) && isSlow && startState.z < 3 && endState.z > 4) {
            result.stars = 3;
            result.passed = true;
            result.feedback = "Masterful pacing! The slow reveal perfectly builds tension.";
            result.whatWasUsed = dollyOut ? "Slow Dolly Out" : "Slow Zoom Out";
            result.howItMoved = "The camera slowly pulled away from a tight detail to reveal the wider context.";
            result.visualEffect = "Creates anticipation, isolation, or reveals a broader, perhaps dangerous, situation.";
            result.whenUseful = "Horror/thriller reveals, showing a character's isolation, or ending a scene on an uncertain note.";
            result.tips = "Excellent work. You can further enhance this by combining a dolly out with a slow pan to reveal something specific.";
          } else if ((dollyOut || zoomOut) && startState.z < 3 && endState.z > 4) {
            result.stars = 2;
            result.passed = true;
            result.feedback = "The movement was correct, but the speed was too fast to build tension effectively.";
            result.whatWasUsed = "Fast Pull Out";
            result.howItMoved = "The camera moved back quickly.";
            result.visualEffect = "Provides information rapidly, but loses the suspenseful build-up.";
            result.whenUseful = "Action sequences or quick comedic reveals.";
            result.tips = "Slow down the movement significantly. Let the audience anticipate what will be revealed.";
          } else {
            result.stars = 1;
            result.passed = false;
            result.feedback = "The camera didn't pull back enough to reveal the scene.";
            result.whatWasUsed = movementAnalysis.primaryMovement ? movementAnalysis.primaryMovement.type : "Minimal movement";
            result.howItMoved = "The camera stayed too close or didn't move backwards.";
            result.visualEffect = "Keeps the audience locked into the detail without providing context.";
            result.whenUseful = "When maintaining extreme focus on a single object or intense emotion.";
            result.tips = "Start close, then slowly move the camera backward (Z-axis) to widen the shot and reveal the environment.";
          }
        }
        break;
    }

    result.title = mission.title;

    // Update progress
    const prevData = this.completedMissions.get(this.currentMissionIndex) || { stars: 0, attempts: 0 };
    if (result.stars > prevData.stars) {
      this.totalStars += (result.stars - prevData.stars);
      prevData.stars = result.stars;
    }
    prevData.attempts++;
    this.completedMissions.set(this.currentMissionIndex, prevData);

    return result;
  }

  /**
   * Retrieves current progress statistics.
   * @returns {Object} Progress stats.
   */
  getProgress() {
    return {
      completed: Array.from(this.completedMissions.values()).filter(m => m.stars > 0).length,
      total: this.missions.length,
      stars: this.totalStars,
      maxStars: this.missions.length * 3
    };
  }

  /**
   * Enables free practice mode.
   */
  enableFreeMode() {
    this.freeMode = true;
  }

  /**
   * Disables free practice mode.
   */
  disableFreeMode() {
    this.freeMode = false;
  }
}
