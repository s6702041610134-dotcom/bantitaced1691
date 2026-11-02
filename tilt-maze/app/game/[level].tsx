import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LEVELS } from '../../data/levels';
import { LevelDefinition, UserSettings } from '../../engine/types';
import { PhysicsEngine, PhysicsBallState } from '../../engine/physics';
import { useMotionSensors } from '../../hooks/useMotionSensors';
import { Maze3DRenderer } from '../../components/Maze3DRenderer';
import { HUD } from '../../components/HUD';
import { VirtualTiltControls } from '../../components/VirtualTiltControls';
import { WinModal } from '../../components/WinModal';
import { GameOverModal } from '../../components/GameOverModal';
import { SoundHaptics } from '../../engine/audioHaptics';
import { GameStorage, DEFAULT_SETTINGS } from '../../store/gameStore';
import { THEME } from '../../constants/theme';

export default function GameScreen() {
  const router = useRouter();
  const { level: levelParam } = useLocalSearchParams<{ level: string }>();
  const levelId = parseInt(levelParam || '1', 10);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Find level template and create mutable copy
  const levelTemplate =
    LEVELS.find(l => l.id === levelId) || LEVELS[0];

  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(() =>
    JSON.parse(JSON.stringify(levelTemplate))
  );

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<'HOLE' | 'TIMEOUT' | 'HAZARD'>('HOLE');
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);

  const [lives, setLives] = useState<number>(3);
  const maxLives = 3;
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    levelTemplate.timeLimitSeconds
  );
  const [finalScore, setFinalScore] = useState<number>(0);

  // === FIX: Use refs for values read inside the game loop to avoid re-creating it ===
  const [renderTick, setRenderTick] = useState<number>(0); // Only for triggering React re-renders
  const renderThrottleRef = useRef<number>(0);

  // Default to true so controls are always visible
  const [virtualPadActive, setVirtualPadActive] = useState<boolean>(true);

  // === FIX: Refs for game state read inside the animation loop ===
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const isLevelWonRef = useRef(false);
  const livesRef = useRef(3);
  const timeElapsedRef = useRef(0);
  const timeRemainingRef = useRef<number | undefined>(levelTemplate.timeLimitSeconds);
  const currentLevelRef = useRef<LevelDefinition>(currentLevel);
  const settingsRef = useRef<UserSettings>(DEFAULT_SETTINGS);

  // Keep refs in sync with state
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { isLevelWonRef.current = isLevelWon; }, [isLevelWon]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { timeElapsedRef.current = timeElapsed; }, [timeElapsed]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // Load user settings
  useEffect(() => {
    GameStorage.loadSettings().then(s => {
      setSettings(s);
      setVirtualPadActive(s.virtualPadEnabled);
    });
  }, []);

  // Motion Sensor Hook
  const {
    tilt,
    isSensorAvailable,
    useVirtual,
    setUseVirtual,
    setVirtualTilt,
  } = useMotionSensors({
    sensitivity: settings.sensitivity,
    filterAlpha: settings.filterAlpha,
    calibratedOffset: settings.calibratedOffset,
  });

  // === FIX: Store tilt in a ref so the game loop reads it without being a dependency ===
  const tiltRef = useRef(tilt);
  useEffect(() => { tiltRef.current = tilt; }, [tilt]);

  // Calculate Board Dimensions (fit nicely inside screen with padding)
  const maxBoardWidth = Math.min(windowWidth - 32, 420);
  const maxBoardHeight = windowHeight - (virtualPadActive ? 270 : 170);

  const cols = currentLevel.gridCols;
  const rows = currentLevel.gridRows;

  // Preserve cell square aspect ratio
  const cellSizeByWidth = maxBoardWidth / cols;
  const cellSizeByHeight = maxBoardHeight / rows;
  const cellSize = Math.floor(Math.min(cellSizeByWidth, cellSizeByHeight));
  const cellSizeRef = useRef(cellSize);
  useEffect(() => { cellSizeRef.current = cellSize; }, [cellSize]);

  const boardWidth = cellSize * cols;
  const boardHeight = cellSize * rows;

  // Ball Physics State
  const ballRadius = cellSize * 0.36;
  const ballRef = useRef<PhysicsBallState>({
    x: (currentLevel.startPos.x + 0.5) * cellSize,
    y: (currentLevel.startPos.y + 0.5) * cellSize,
    vx: 0,
    vy: 0,
    radius: ballRadius,
    isFalling: false,
    fallProgress: 0,
  });

  const physicsEngineRef = useRef<PhysicsEngine>(new PhysicsEngine());
  const lastTimeRef = useRef<number>(Date.now());

  // Reset ball to start position
  const resetBallPosition = useCallback(() => {
    ballRef.current.x = (currentLevel.startPos.x + 0.5) * cellSize;
    ballRef.current.y = (currentLevel.startPos.y + 0.5) * cellSize;
    ballRef.current.vx = 0;
    ballRef.current.vy = 0;
    ballRef.current.isFalling = false;
    ballRef.current.fallProgress = 0;
  }, [cellSize, currentLevel.startPos]);

  // Restart level completely
  const handleRestart = useCallback(() => {
    setCurrentLevel(JSON.parse(JSON.stringify(levelTemplate)));
    setLives(maxLives);
    livesRef.current = maxLives;
    setTimeElapsed(0);
    timeElapsedRef.current = 0;
    setTimeRemaining(levelTemplate.timeLimitSeconds);
    timeRemainingRef.current = levelTemplate.timeLimitSeconds;
    setIsGameOver(false);
    isGameOverRef.current = false;
    setIsLevelWon(false);
    isLevelWonRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    resetBallPosition();
    lastTimeRef.current = Date.now();
  }, [levelTemplate, maxLives, resetBallPosition]);

  // === FIX: Main Game Loop — runs once, reads everything from refs ===
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const now = Date.now();
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Cap dt to prevent physics explosions on tab switch / long frames
      const dt = Math.min(0.033, rawDt); // Max ~30ms step (prevents tunneling)

      if (dt <= 0) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // Read from refs — no React state dependency!
      const paused = isPausedRef.current;
      const gameOver = isGameOverRef.current;
      const levelWon = isLevelWonRef.current;

      if (!paused && !gameOver && !levelWon) {
        const currentTilt = tiltRef.current;
        const level = currentLevelRef.current;
        const cs = cellSizeRef.current;
        const sett = settingsRef.current;

        // 1. Update Timer
        timeElapsedRef.current += dt;
        setTimeElapsed(timeElapsedRef.current);

        if (timeRemainingRef.current !== undefined) {
          timeRemainingRef.current -= dt;
          if (timeRemainingRef.current <= 0) {
            timeRemainingRef.current = 0;
            setTimeRemaining(0);
            setIsGameOver(true);
            isGameOverRef.current = true;
            setGameOverReason('TIMEOUT');
            SoundHaptics.playGameOver(sett.soundEnabled, sett.hapticsEnabled);
          } else {
            setTimeRemaining(timeRemainingRef.current);
          }
        }

        // 2. Update Moving Hazards
        physicsEngineRef.current.updateHazards(level.movingHazards, dt);

        // 3. Update Ball Physics & Collisions
        const events = physicsEngineRef.current.update(
          ballRef.current,
          currentTilt,
          level,
          cs,
          dt
        );

        // 4. Process Collision Events
        for (const evt of events) {
          if (evt.type === 'WALL') {
            SoundHaptics.playWallBump(sett.soundEnabled, sett.hapticsEnabled);
          } else if (evt.type === 'STAR') {
            SoundHaptics.playStarCollect(sett.soundEnabled, sett.hapticsEnabled);
          } else if (evt.type === 'KEY') {
            SoundHaptics.playKeyCollect(sett.soundEnabled, sett.hapticsEnabled);
          } else if (evt.type === 'HOLE') {
            SoundHaptics.playHoleFall(sett.soundEnabled, sett.hapticsEnabled);
            // Delay respawn to let hole fall animation play
            setTimeout(() => {
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) {
                setIsGameOver(true);
                isGameOverRef.current = true;
                setGameOverReason('HOLE');
                SoundHaptics.playGameOver(sett.soundEnabled, sett.hapticsEnabled);
              } else {
                resetBallPosition();
              }
            }, 600);
          } else if (evt.type === 'HAZARD') {
            SoundHaptics.playHoleFall(sett.soundEnabled, sett.hapticsEnabled);
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              setIsGameOver(true);
              isGameOverRef.current = true;
              setGameOverReason('HAZARD');
              SoundHaptics.playGameOver(sett.soundEnabled, sett.hapticsEnabled);
            }
          } else if (evt.type === 'GOAL') {
            // Victory!
            setIsLevelWon(true);
            isLevelWonRef.current = true;
            SoundHaptics.playLevelWin(sett.soundEnabled, sett.hapticsEnabled);

            // Compute Score:
            const collectedStarsCount = level.collectibles.filter(
              c => c.type === 'STAR' && c.collected
            ).length;

            const elapsed = timeElapsedRef.current;
            const timeBonus = Math.max(0, 500 - Math.floor(elapsed * 5));
            const currentLives = livesRef.current;
            const calculatedScore =
              1000 +
              collectedStarsCount * 350 +
              currentLives * 250 +
              timeBonus;

            setFinalScore(calculatedScore);

            const totalLevelStars = level.collectibles.filter(
              c => c.type === 'STAR'
            ).length;
            const starsRating =
              totalLevelStars > 0
                ? Math.min(3, Math.max(1, Math.ceil((collectedStarsCount / totalLevelStars) * 3)))
                : 3;

            // Save Progress
            GameStorage.recordLevelCompletion(
              level.id,
              starsRating,
              calculatedScore,
              Math.round(elapsed)
            );
          }
        }
      }

      // === FIX: Throttle React render updates to ~30fps instead of ~60fps ===
      renderThrottleRef.current += 1;
      if (renderThrottleRef.current >= 2) {
        renderThrottleRef.current = 0;
        setRenderTick(prev => prev + 1);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetBallPosition]); // Only depends on resetBallPosition — NOT on tilt, isPaused, etc.

  const starsCollected = currentLevel.collectibles.filter(
    c => c.type === 'STAR' && c.collected
  ).length;

  const totalStars = currentLevel.collectibles.filter(
    c => c.type === 'STAR'
  ).length;

  const hasKeyPink = currentLevel.collectibles.some(
    c => c.type === 'KEY' && c.keyColor === 'PINK' && c.collected
  );

  const hasKeyBlue = currentLevel.collectibles.some(
    c => c.type === 'KEY' && c.keyColor === 'BLUE' && c.collected
  );

  const hasNextLevel = levelId < LEVELS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. In-game HUD */}
      <HUD
        levelTitle={currentLevel.title}
        lives={lives}
        maxLives={maxLives}
        starsCollected={starsCollected}
        totalStars={totalStars}
        hasKeyPink={hasKeyPink}
        hasKeyBlue={hasKeyBlue}
        timeRemaining={timeRemaining}
        timeElapsed={timeElapsed}
        isSensorActive={isSensorAvailable && !useVirtual}
        onPause={() => setIsPaused(true)}
        onToggleVirtualPad={() => {
          const next = !virtualPadActive;
          setVirtualPadActive(next);
          setUseVirtual(next);
        }}
        virtualPadActive={virtualPadActive}
      />

      {/* 2. Recessed CRT Frame & 3D Maze Board Container */}
      <View style={styles.boardContainer}>
        <Maze3DRenderer
          level={currentLevel}
          ball={ballRef.current}
          tilt={tiltRef.current}
          cellSize={cellSize}
          width={boardWidth}
          height={boardHeight}
          animTick={renderTick}
        />
      </View>

      {/* 3. Tactile On-Screen Controls (Joystick + Physical Arcade D-pad) */}
      {virtualPadActive && (
        <View style={styles.virtualPadWrapper}>
          <VirtualTiltControls
            onTiltChange={t => {
              setUseVirtual(true);
              setVirtualTilt(t);
            }}
            currentTilt={tilt}
          />
          {/* Tactile D-pad for key press simulation */}
          <View style={styles.dpad}>
            <View style={styles.dpadRow}>
              <Pressable
                style={({ pressed }) => [styles.dpadBtn, pressed && styles.dpadBtnPressed]}
                onPressIn={() => { setUseVirtual(true); setVirtualTilt({ x: 0, y: -0.45 }); }}
                onPressOut={() => setVirtualTilt({ x: 0, y: 0 })}
              >
                <Text style={styles.dpadLabel}>▲</Text>
              </Pressable>
            </View>
            <View style={styles.dpadRow}>
              <Pressable
                style={({ pressed }) => [styles.dpadBtn, pressed && styles.dpadBtnPressed]}
                onPressIn={() => { setUseVirtual(true); setVirtualTilt({ x: -0.45, y: 0 }); }}
                onPressOut={() => setVirtualTilt({ x: 0, y: 0 })}
              >
                <Text style={styles.dpadLabel}>◀</Text>
              </Pressable>
              <View style={styles.dpadCenter} />
              <Pressable
                style={({ pressed }) => [styles.dpadBtn, pressed && styles.dpadBtnPressed]}
                onPressIn={() => { setUseVirtual(true); setVirtualTilt({ x: 0.45, y: 0 }); }}
                onPressOut={() => setVirtualTilt({ x: 0, y: 0 })}
              >
                <Text style={styles.dpadLabel}>▶</Text>
              </Pressable>
            </View>
            <View style={styles.dpadRow}>
              <Pressable
                style={({ pressed }) => [styles.dpadBtn, pressed && styles.dpadBtnPressed]}
                onPressIn={() => { setUseVirtual(true); setVirtualTilt({ x: 0, y: 0.45 }); }}
                onPressOut={() => setVirtualTilt({ x: 0, y: 0 })}
              >
                <Text style={styles.dpadLabel}>▼</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* 4. Pause Menu Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>SYSTEM PAUSED</Text>

            <View style={styles.pauseButtons}>
              <TouchableOpacity
                style={styles.btnResume}
                onPress={() => {
                  lastTimeRef.current = Date.now();
                  setIsPaused(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="play-sharp" size={16} color={THEME.colors.offWhite} />
                <Text style={styles.btnResumeText}>RESUME EXECUTION</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPauseSecondary}
                onPress={handleRestart}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-sharp" size={16} color={THEME.colors.charcoal} />
                <Text style={styles.btnPauseSecondaryText}>RESTART SECTOR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPauseSecondary}
                onPress={() => {
                  setIsPaused(false);
                  router.push('/levels');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="grid-sharp" size={16} color={THEME.colors.charcoal} />
                <Text style={styles.btnPauseSecondaryText}>SELECT SECTOR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPauseSecondary}
                onPress={() => {
                  setIsPaused(false);
                  router.push('/settings');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="options-sharp" size={16} color={THEME.colors.charcoal} />
                <Text style={styles.btnPauseSecondaryText}>CALIBRATE SENSORS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Win Celebration Modal */}
      <WinModal
        visible={isLevelWon}
        starsEarned={starsCollected}
        totalStars={totalStars}
        timeElapsed={timeElapsed}
        finalScore={finalScore}
        hasNextLevel={hasNextLevel}
        onNextLevel={() => {
          setIsLevelWon(false);
          router.replace(`/game/${levelId + 1}`);
        }}
        onReplay={handleRestart}
        onLevelSelect={() => {
          setIsLevelWon(false);
          router.replace('/levels');
        }}
      />

      {/* 6. Game Over Modal */}
      <GameOverModal
        visible={isGameOver}
        reason={gameOverReason}
        onRetry={handleRestart}
        onLevelSelect={() => {
          setIsGameOver(false);
          router.replace('/levels');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.ivory,
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  virtualPadWrapper: {
    paddingBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  dpad: {
    alignItems: 'center',
    gap: 2,
  },
  dpadRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  dpadCenter: {
    width: 38,
    height: 38,
  },
  dpadBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: THEME.colors.paper,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  dpadBtnPressed: {
    backgroundColor: THEME.colors.olive,
  },
  dpadLabel: {
    color: THEME.colors.charcoal,
    fontSize: 14,
    fontWeight: '900',
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 37, 37, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: THEME.colors.paper,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  pauseTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.charcoal,
    letterSpacing: 1,
    marginBottom: 16,
  },
  pauseButtons: {
    width: '100%',
    gap: 10,
  },
  btnResume: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.teal,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  btnResumeText: {
    color: THEME.colors.offWhite,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btnPauseSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.paper,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME.colors.charcoal,
    shadowColor: THEME.colors.charcoal,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnPauseSecondaryText: {
    color: THEME.colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
