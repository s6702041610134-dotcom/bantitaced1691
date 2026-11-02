import React from 'react';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Ellipse,
  Filter,
  FeDropShadow,
} from 'react-native-svg';
import { Vector2D } from '../engine/types';

interface Ball3DProps {
  x: number;
  y: number;
  radius: number;
  tilt: Vector2D;
  isFalling: boolean;
  fallProgress: number; // 0 to 1
}

export const Ball3D: React.FC<Ball3DProps> = ({
  x,
  y,
  radius,
  tilt,
  isFalling,
  fallProgress,
}) => {
  // Scale down when falling
  const scale = isFalling ? Math.max(0.01, 1 - fallProgress) : 1;
  const currentRadius = radius * scale;
  const opacity = isFalling ? Math.max(0, 1 - fallProgress * 1.2) : 1;

  // Specular highlight shifts opposite to tilt to simulate fixed overhead spotlight
  const highlightOffsetX = -tilt.x * (radius * 0.4);
  const highlightOffsetY = -tilt.y * (radius * 0.4);

  const cxHighlight = 35 + highlightOffsetX * 1.5;
  const cyHighlight = 30 + highlightOffsetY * 1.5;

  return (
    <>
      {/* 1. Ball Drop Shadow */}
      <Ellipse
        cx={x + tilt.x * 4}
        cy={y + currentRadius * 0.75 + tilt.y * 3}
        rx={currentRadius * 0.85}
        ry={currentRadius * 0.4}
        fill="rgba(0, 0, 0, 0.45)"
        opacity={opacity * 0.8}
      />

      {/* 2. Ball Sphere with 3D Radial Gradient */}
      <Defs>
        <RadialGradient
          id="ballSphereGrad"
          cx={`${cxHighlight}%`}
          cy={`${cyHighlight}%`}
          r="65%"
          fx={`${cxHighlight}%`}
          fy={`${cyHighlight}%`}
        >
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="18%" stopColor="#FEF08A" stopOpacity="1" />
          <Stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
          <Stop offset="85%" stopColor="#B45309" stopOpacity="1" />
          <Stop offset="100%" stopColor="#78350F" stopOpacity="1" />
        </RadialGradient>

        <RadialGradient id="ballRimGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="80%" stopColor="#FDE68A" stopOpacity="0" />
          <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>

      {/* Main Sphere */}
      <Circle
        cx={x}
        cy={y}
        r={currentRadius}
        fill="url(#ballSphereGrad)"
        opacity={opacity}
      />

      {/* Metallic Rim Glow */}
      <Circle
        cx={x}
        cy={y}
        r={currentRadius}
        fill="url(#ballRimGlow)"
        opacity={opacity}
      />

      {/* Crisp Specular Ping */}
      <Circle
        cx={x - currentRadius * 0.3 + highlightOffsetX * 0.4}
        cy={y - currentRadius * 0.35 + highlightOffsetY * 0.4}
        r={currentRadius * 0.22}
        fill="#FFFFFF"
        opacity={opacity * 0.75}
      />
    </>
  );
};
