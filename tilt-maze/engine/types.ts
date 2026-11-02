export type CellType = 
  | 'EMPTY'
  | 'WALL'
  | 'HOLE'
  | 'GOAL'
  | 'STAR'
  | 'KEY'
  | 'DOOR';

export interface Vector2D {
  x: number;
  y: number;
}

export interface SensorReading {
  x: number;
  y: number;
  z: number;
}

export interface MotionData {
  pitch: number;        // Tilting forward/backward (X tilt) in radians
  roll: number;         // Tilting left/right (Y tilt) in radians
  rawAccel: SensorReading;
  rawGyro: SensorReading;
  isSensorActive: boolean;
  isCalibrated: boolean;
}

export interface CollectibleItem {
  id: string;
  type: 'STAR' | 'KEY';
  gridX: number;
  gridY: number;
  keyColor?: 'PINK' | 'BLUE';
  doorId?: string;
  collected: boolean;
}

export interface HoleHazard {
  id: string;
  gridX: number;
  gridY: number;
  radius: number;
}

export interface MovingHazard {
  id: string;
  startGridX: number;
  startGridY: number;
  endGridX: number;
  endGridY: number;
  speed: number;       // speed factor
  currentX: number;
  currentY: number;
  direction: 1 | -1;
  width: number;
  height: number;
}

export interface DoorObstacle {
  id: string;
  gridX: number;
  gridY: number;
  keyRequired: 'PINK' | 'BLUE';
  isOpen: boolean;
}

export interface LevelDefinition {
  id: number;
  title: string;
  subtitle: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MASTER';
  gridCols: number;
  gridRows: number;
  startPos: Vector2D;
  goalPos: Vector2D;
  timeLimitSeconds?: number;
  grid: number[][]; // 0: empty, 1: wall
  holes: HoleHazard[];
  collectibles: CollectibleItem[];
  doors: DoorObstacle[];
  movingHazards: MovingHazard[];
}

export interface UserGameProgress {
  unlockedLevels: number[];
  highScores: Record<number, number>;
  starsEarned: Record<number, number>;
  bestTimes: Record<number, number>;
}

export interface UserSettings {
  sensitivity: number;        // 0.5 to 2.5
  filterAlpha: number;        // Complementary filter alpha 0.5 to 0.95
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  virtualPadEnabled: boolean;
  calibratedOffset: Vector2D;
}
