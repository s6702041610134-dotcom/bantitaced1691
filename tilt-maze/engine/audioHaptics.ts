import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class AudioHapticsManager {
  private lastWallHapticTime: number = 0;
  private audioCtx: any = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {
        // AudioContext not supported
      }
    }
  }

  private resumeAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  // Synthesize custom sound wave
  private playTone(freq: number, type: OscillatorType, duration: number, gain = 0.1) {
    if (!this.audioCtx) return;
    try {
      this.resumeAudioContext();
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + duration
      );

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio play failed
    }
  }

  public playWallBump(soundEnabled = true, hapticsEnabled = true) {
    const now = Date.now();
    if (now - this.lastWallHapticTime < 120) return; // throttle
    this.lastWallHapticTime = now;

    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) {
      this.playTone(180, 'sine', 0.05, 0.08);
    }
  }

  public playStarCollect(soundEnabled = true, hapticsEnabled = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) {
      this.playTone(587.33, 'triangle', 0.1, 0.15); // D5
      setTimeout(() => this.playTone(880, 'triangle', 0.18, 0.15), 60); // A5
    }
  }

  public playKeyCollect(soundEnabled = true, hapticsEnabled = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) {
      this.playTone(523.25, 'triangle', 0.1, 0.18); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.18), 70); // E5
      setTimeout(() => this.playTone(783.99, 'triangle', 0.22, 0.2), 140); // G5
    }
  }

  public playHoleFall(soundEnabled = true, hapticsEnabled = true) {
    if (hapticsEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled && this.audioCtx) {
      try {
        this.resumeAudioContext();
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          60,
          this.audioCtx.currentTime + 0.4
        );

        gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioCtx.currentTime + 0.4
        );

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.4);
      } catch (e) {}
    }
  }

  public playLevelWin(soundEnabled = true, hapticsEnabled = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) {
      // Fanfare sequence
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.25, 0.2);
        }, idx * 110);
      });
    }
  }

  public playGameOver(soundEnabled = true, hapticsEnabled = true) {
    if (hapticsEnabled) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } catch (e) {}
    }

    if (soundEnabled) {
      const notes = [350, 310, 260, 200];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.2, 0.15);
        }, idx * 120);
      });
    }
  }
}

export const SoundHaptics = new AudioHapticsManager();
