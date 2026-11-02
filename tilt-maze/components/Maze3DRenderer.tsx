import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { LevelDefinition, Vector2D } from '../engine/types';
import { PhysicsBallState } from '../engine/physics';
import { THEME } from '../constants/theme';

interface Maze3DRendererProps {
  level: LevelDefinition;
  ball: PhysicsBallState;
  tilt: Vector2D;
  cellSize: number;
  width: number;
  height: number;
  animTick: number;
}

/**
 * Static maze elements (floor, walls) — memoized so they never re-render
 * unless the level or dimensions change.
 */
const StaticMaze = React.memo(({
  level,
  cellSize,
  width,
  height,
  theme,
}: {
  level: LevelDefinition;
  cellSize: number;
  width: number;
  height: number;
  theme: any;
}) => {
  const wallDepth = cellSize * 0.22;

  return (
    <>
      {/* Base Floor */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={theme.boardBg}
        rx={12}
      />

      {/* Subtle grid lines (simple, no per-cell rects) */}
      {Array.from({ length: level.gridRows + 1 }).map((_, r) => (
        <Rect
          key={`hline_${r}`}
          x={0}
          y={r * cellSize}
          width={width}
          height={1}
          fill="rgba(255,255,255,0.04)"
        />
      ))}
      {Array.from({ length: level.gridCols + 1 }).map((_, c) => (
        <Rect
          key={`vline_${c}`}
          x={c * cellSize}
          y={0}
          width={1}
          height={height}
          fill="rgba(255,255,255,0.04)"
        />
      ))}

      {/* Walls — static, never change */}
      {level.grid.map((row, r) =>
        row.map((cell, c) => {
          if (cell !== 1) return null;

          const wx = c * cellSize;
          const wy = r * cellSize;

          return (
            <G key={`wall_${r}_${c}`}>
              {/* Shadow */}
              <Rect
                x={wx + 2}
                y={wy + 3}
                width={cellSize}
                height={cellSize}
                fill="rgba(0, 0, 0, 0.35)"
                rx={3}
              />
              {/* Front face */}
              <Rect
                x={wx}
                y={wy + wallDepth}
                width={cellSize}
                height={cellSize - wallDepth}
                fill={theme.wallFront}
                rx={3}
              />
              {/* Top face */}
              <Rect
                x={wx}
                y={wy}
                width={cellSize}
                height={cellSize - wallDepth}
                fill={theme.wallTop}
                stroke={theme.wallHighlight}
                strokeWidth={0.5}
                rx={3}
              />
            </G>
          );
        })
      )}
    </>
  );
});

export const Maze3DRenderer: React.FC<Maze3DRendererProps> = ({
  level,
  ball,
  tilt,
  cellSize,
  width,
  height,
  animTick,
}) => {
  const theme =
    THEME.levelThemes[level.id as keyof typeof THEME.levelThemes] ||
    THEME.levelThemes[1];

  // NO board tilt — flat, stable view (user requested: ไม่ต้องเอียงตาม)

  // Simple pulse value for minimal animation
  const pulse = (animTick % 60) / 60; // 0-1 over ~2 seconds at 30fps render

  // Ball scale for falling
  const ballScale = ball.isFalling ? Math.max(0.01, 1 - ball.fallProgress) : 1;
  const ballRadius = ball.radius * ballScale;
  const ballOpacity = ball.isFalling ? Math.max(0, 1 - ball.fallProgress * 1.2) : 1;

  return (
    <View
      style={[
        styles.boardOuter,
        { width, height },
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Hole gradient */}
          <RadialGradient id="holeAbyss" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#000000" />
            <Stop offset="70%" stopColor="#120306" />
            <Stop offset="95%" stopColor="#7F1D1D" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
          </RadialGradient>

          {/* Goal gradient */}
          <RadialGradient id="goalPortal" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.95" />
            <Stop offset="45%" stopColor="#10B981" stopOpacity="0.85" />
            <Stop offset="80%" stopColor="#047857" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
          </RadialGradient>

          {/* Ball gradient */}
          <RadialGradient id="ballGrad" cx="35%" cy="30%" r="65%" fx="35%" fy="30%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="18%" stopColor="#FEF08A" stopOpacity="1" />
            <Stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
            <Stop offset="85%" stopColor="#B45309" stopOpacity="1" />
            <Stop offset="100%" stopColor="#78350F" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* 1. Static maze (memoized — floor + walls) */}
        <StaticMaze
          level={level}
          cellSize={cellSize}
          width={width}
          height={height}
          theme={theme}
        />

        {/* 2. Goal Portal */}
        {(() => {
          const gx = (level.goalPos.x + 0.5) * cellSize;
          const gy = (level.goalPos.y + 0.5) * cellSize;
          const portalRadius = cellSize * 0.42;

          return (
            <G key="goal_portal">
              <Circle
                cx={gx}
                cy={gy}
                r={portalRadius * 1.2}
                fill="none"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="6,4"
                opacity={0.6 + pulse * 0.3}
              />
              <Circle cx={gx} cy={gy} r={portalRadius} fill="url(#goalPortal)" />
              <Circle cx={gx} cy={gy} r={portalRadius * 0.4} fill="#34D399" opacity={0.85} />
              <SvgText
                x={gx}
                y={gy + 4}
                textAnchor="middle"
                fontSize={cellSize * 0.35}
                fill="#FFFFFF"
                fontWeight="bold"
              >
                🏁
              </SvgText>
            </G>
          );
        })()}

        {/* 3. Holes */}
        {level.holes.map(hole => {
          const hx = (hole.gridX + 0.5) * cellSize;
          const hy = (hole.gridY + 0.5) * cellSize;
          const hr = hole.radius * cellSize * 0.45;

          return (
            <G key={hole.id}>
              <Circle cx={hx} cy={hy} r={hr * 1.2} fill="none" stroke="#EF4444" strokeWidth={2} opacity={0.5} />
              <Circle cx={hx} cy={hy} r={hr} fill="url(#holeAbyss)" />
              <Circle cx={hx} cy={hy} r={hr * 0.6} fill="#000000" />
            </G>
          );
        })}

        {/* 4. Collectibles */}
        {level.collectibles.map(item => {
          if (item.collected) return null;
          const ix = (item.gridX + 0.5) * cellSize;
          const iy = (item.gridY + 0.5) * cellSize;
          const itemSize = cellSize * 0.36;

          if (item.type === 'STAR') {
            return (
              <G key={item.id}>
                <Circle cx={ix} cy={iy} r={itemSize * 1.1} fill="rgba(245, 158, 11, 0.25)" />
                <SvgText x={ix} y={iy + itemSize * 0.45} textAnchor="middle" fontSize={itemSize * 1.4}>
                  ⭐
                </SvgText>
              </G>
            );
          } else {
            const isPink = item.keyColor === 'PINK';
            return (
              <G key={item.id}>
                <Circle
                  cx={ix}
                  cy={iy}
                  r={itemSize * 1.1}
                  fill={isPink ? 'rgba(236, 72, 153, 0.35)' : 'rgba(6, 182, 212, 0.35)'}
                />
                <SvgText x={ix} y={iy + itemSize * 0.45} textAnchor="middle" fontSize={itemSize * 1.4}>
                  {isPink ? '🗝️' : '🔑'}
                </SvgText>
              </G>
            );
          }
        })}

        {/* 5. Doors */}
        {level.doors.map(door => {
          if (door.isOpen) return null;
          const dx = door.gridX * cellSize;
          const dy = door.gridY * cellSize;
          const isPink = door.keyRequired === 'PINK';
          const gateColor = isPink ? '#EC4899' : '#06B6D4';

          return (
            <G key={door.id}>
              <Rect
                x={dx + 2}
                y={dy + 2}
                width={cellSize - 4}
                height={cellSize - 4}
                fill="rgba(15, 23, 42, 0.85)"
                stroke={gateColor}
                strokeWidth={3}
                rx={6}
              />
              <SvgText x={dx + cellSize / 2} y={dy + cellSize / 2 + 5} textAnchor="middle" fontSize={cellSize * 0.4}>
                🔒
              </SvgText>
            </G>
          );
        })}

        {/* 6. Moving Hazards */}
        {level.movingHazards.map(hazard => {
          const hx = hazard.currentX * cellSize;
          const hy = hazard.currentY * cellSize;
          const hw = hazard.width * cellSize;
          const hh = hazard.height * cellSize;

          return (
            <G key={hazard.id}>
              <Rect x={hx + 2} y={hy + 3} width={hw} height={hh} fill="rgba(0,0,0,0.3)" rx={4} />
              <Rect x={hx} y={hy} width={hw} height={hh} fill="#DC2626" stroke="#F87171" strokeWidth={2} rx={4} />
              <SvgText x={hx + hw / 2} y={hy + hh / 2 + 5} textAnchor="middle" fontSize={hh * 0.5}>
                ⚠️
              </SvgText>
            </G>
          );
        })}

        {/* 7. Ball — simple, fast rendering */}
        {/* Shadow */}
        <Circle
          cx={ball.x}
          cy={ball.y + ballRadius * 0.6}
          r={ballRadius * 0.8}
          fill="rgba(0, 0, 0, 0.35)"
          opacity={ballOpacity * 0.7}
        />
        {/* Main sphere */}
        <Circle
          cx={ball.x}
          cy={ball.y}
          r={ballRadius}
          fill="url(#ballGrad)"
          opacity={ballOpacity}
        />
        {/* Specular highlight */}
        <Circle
          cx={ball.x - ballRadius * 0.25}
          cy={ball.y - ballRadius * 0.3}
          r={ballRadius * 0.2}
          fill="#FFFFFF"
          opacity={ballOpacity * 0.7}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  boardOuter: {
    borderRadius: 16,
    backgroundColor: '#0B0C1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2A2E54',
  },
});
