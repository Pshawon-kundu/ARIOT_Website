'use client';

import { motion } from 'motion/react';

/**
 * AutonomyVisual — lightweight top-down facility-navigation simulation.
 *
 * Pure SVG + Motion (no video, no extra 3D lib) so it stays sharp, small, and
 * responsive. Tells the story map → plan → navigate → detect obstacle → replan
 * → reach goal on an 8s seamless loop.
 *
 * `animate` is driven by the parent (true only while the section is in view and
 * reduced motion is off), so it pauses offscreen and freezes to the final frame
 * when reduced motion is requested. `emphasis` links the left-column tech-tag
 * hovers to a subtle highlight inside the sim.
 */

const CYCLE = 8;
const LOOP = (times: number[]) => ({
  duration: CYCLE,
  repeat: Infinity,
  ease: 'linear' as const,
  times,
});

type Emphasis = 'slam' | 'lidar' | 'ros' | null;

// ── Geometry (viewBox 0 0 480 320) ───────────────────────────────────────────
const P_ORIGINAL = 'M70,270 L120,270 L120,90 L420,70';
const P_REPLAN = 'M120,210 L330,210 L330,90 L420,70';
const ROBOT_END = { x: 420, y: 70 };
const ROBOT_TIMES = [0, 0.19, 0.38, 0.5, 0.63, 0.75, 0.85, 0.94, 1];
const ROBOT_X = [70, 70, 70, 120, 120, 120, 330, 420, 420];
const ROBOT_Y = [270, 270, 270, 270, 210, 210, 210, 70, 70];
const ROBOT_OP = [0, 1, 1, 1, 1, 1, 1, 1, 0];

const GRAY = '#9aa6b2';
const ORANGE = 'var(--brand-orange)';
const NAVY = 'var(--brand-navy)';

function Route({
  d,
  stroke,
  width,
  animate,
  offset,
  opacity,
  finalOffset = 0,
  finalOpacity = 1,
}: {
  d: string;
  stroke: string;
  width: number;
  animate: boolean;
  offset: { kf: number[]; times: number[] };
  opacity?: { kf: number[]; times: number[] };
  finalOffset?: number;
  finalOpacity?: number;
}) {
  if (!animate) {
    return (
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1}
        strokeDashoffset={finalOffset}
        opacity={finalOpacity}
        pathLength={1}
      />
    );
  }
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={1}
      pathLength={1}
      animate={{ strokeDashoffset: offset.kf, ...(opacity ? { opacity: opacity.kf } : {}) }}
      transition={
        opacity
          ? { strokeDashoffset: LOOP(offset.times), opacity: LOOP(opacity.times) }
          : LOOP(offset.times)
      }
    />
  );
}

function Hud({
  x,
  y,
  anchor,
  text,
  a,
  b,
  animate,
}: {
  x: number;
  y: number;
  anchor: 'start' | 'end';
  text: string;
  a: number;
  b: number;
  animate: boolean;
}) {
  if (!animate) {
    return (
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fontSize={11}
        fontFamily="mono"
        fill={GRAY}
        letterSpacing={1}
      >
        {text}
      </text>
    );
  }
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={11}
      fontFamily="mono"
      letterSpacing={1}
      animate={{
        fill: [GRAY, ORANGE, ORANGE, GRAY],
        opacity: [0.45, 1, 1, 0.45],
      }}
      transition={LOOP([0, a, b, 1])}
    >
      {text}
    </motion.text>
  );
}

function Caption({
  text,
  a,
  b,
  animate,
}: {
  text: string;
  a: number;
  b: number;
  animate: boolean;
}) {
  if (!animate) return null;
  const op = a <= 0 ? [1, 1, 0, 0] : [0, 0, 1, 1, 0, 0];
  const tm =
    a <= 0
      ? [0, b, Math.min(1, b + 0.01), 1]
      : [0, Math.max(0.01, a - 0.01), a, b, Math.min(1, b + 0.01), 1];
  return (
    <motion.text
      x={240}
      y={36}
      textAnchor="middle"
      fontSize={12}
      fontFamily="mono"
      letterSpacing={2}
      fill={ORANGE}
      animate={{ opacity: op }}
      transition={LOOP(tm)}
    >
      {text}
    </motion.text>
  );
}

export function AutonomyVisual({
  animate,
  emphasis = null,
}: {
  animate: boolean;
  emphasis?: Emphasis;
}) {
  const blockStroke = emphasis === 'slam' ? ORANGE : NAVY;
  const routeBoost = emphasis === 'ros';
  const lidarBoost = emphasis === 'lidar';

  return (
    <svg
      viewBox="0 0 480 320"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Floor */}
      <rect x={24} y={24} width={432} height={272} rx={10} fill="#f7f9fc" />

      {/* Corner crop marks — engineering-sim feel */}
      {[
        [24, 24, 1, 1],
        [456, 24, -1, 1],
        [24, 296, 1, -1],
        [456, 296, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <g key={i} stroke={GRAY} strokeWidth={1.5} opacity={0.6}>
          <line x1={cx} y1={cy} x2={cx + 14 * (sx as number)} y2={cy} />
          <line x1={cx} y1={cy} x2={cx} y2={cy + 14 * (sy as number)} />
        </g>
      ))}

      {/* Outer walls */}
      <rect
        x={24}
        y={24}
        width={432}
        height={272}
        rx={10}
        fill="none"
        stroke={NAVY}
        strokeWidth={3}
      />
      {/* Central machine block */}
      <rect
        x={210}
        y={120}
        width={80}
        height={80}
        rx={6}
        fill="#eef2f7"
        stroke={blockStroke}
        strokeWidth={emphasis === 'slam' ? 3 : 2}
      />

      {/* Path history (navy, behind) */}
      <Route
        d={P_ORIGINAL}
        stroke={NAVY}
        width={6}
        animate={animate}
        offset={{ kf: [1, 1, 1, 0, 0], times: [0, 0.19, 0.38, 0.63, 1] }}
        opacity={{ kf: [0.5, 0.5], times: [0, 1] }}
        finalOffset={0}
        finalOpacity={0.5}
      />
      <Route
        d={P_REPLAN}
        stroke={NAVY}
        width={6}
        animate={animate}
        offset={{ kf: [1, 1, 0, 0], times: [0, 0.75, 0.94, 1] }}
        opacity={{ kf: [0.5, 0.5], times: [0, 1] }}
        finalOffset={0}
        finalOpacity={0.5}
      />

      {/* Active routes (orange, front) */}
      <Route
        d={P_ORIGINAL}
        stroke={ORANGE}
        width={routeBoost ? 4 : 3}
        animate={animate}
        offset={{ kf: [1, 1, 0, 0], times: [0, 0.19, 0.38, 1] }}
        opacity={{ kf: [0, 0, 1, 0, 0], times: [0, 0.19, 0.75, 0.85, 1] }}
        finalOffset={0}
        finalOpacity={1}
      />
      <Route
        d={P_REPLAN}
        stroke={ORANGE}
        width={routeBoost ? 4 : 3}
        animate={animate}
        offset={{ kf: [1, 1, 0, 0], times: [0, 0.75, 0.94, 1] }}
        opacity={{ kf: [0, 0, 1, 1], times: [0, 0.74, 0.75, 1] }}
        finalOffset={0}
        finalOpacity={1}
      />

      {/* Dynamic obstacle */}
      {animate ? (
        <motion.rect
          x={104}
          y={164}
          width={32}
          height={32}
          rx={5}
          fill="#c2c9d2"
          stroke={NAVY}
          strokeWidth={1.5}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={LOOP([0, 0.62, 0.63, 0.94, 1])}
        />
      ) : (
        <rect
          x={104}
          y={164}
          width={32}
          height={32}
          rx={5}
          fill="#c2c9d2"
          stroke={NAVY}
          strokeWidth={1.5}
        />
      )}
      {/* Obstacle alert ring */}
      {animate ? (
        <motion.circle
          cx={120}
          cy={180}
          r={26}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
          animate={{ opacity: [0, 0, 0.9, 0, 0.9, 0] }}
          transition={LOOP([0, 0.62, 0.63, 0.69, 0.75, 1])}
        />
      ) : null}

      {/* Target */}
      {animate ? (
        <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={LOOP([0, 0.18, 0.19, 1])}>
          <circle cx={420} cy={70} r={14} fill="none" stroke={ORANGE} strokeWidth={2} />
          <circle cx={420} cy={70} r={4} fill={ORANGE} />
        </motion.g>
      ) : (
        <g>
          <circle cx={420} cy={70} r={14} fill="none" stroke={ORANGE} strokeWidth={2} />
          <circle cx={420} cy={70} r={4} fill={ORANGE} />
        </g>
      )}

      {/* Robot */}
      {animate ? (
        <motion.g
          animate={{ x: ROBOT_X, y: ROBOT_Y, opacity: ROBOT_OP }}
          transition={LOOP(ROBOT_TIMES)}
        >
          <RobotBody lidar={lidarBoost} />
        </motion.g>
      ) : (
        <g transform={`translate(${ROBOT_END.x},${ROBOT_END.y})`}>
          <RobotBody lidar={false} />
        </g>
      )}

      {/* HUD labels */}
      <Hud x={34} y={300} anchor="start" text="SLAM" a={0.05} b={0.19} animate={animate} />
      <Hud x={446} y={300} anchor="end" text="LOCALIZATION" a={0.2} b={0.37} animate={animate} />
      <Hud x={34} y={56} anchor="start" text="PATH PLANNING" a={0.39} b={0.62} animate={animate} />
      <Hud
        x={446}
        y={56}
        anchor="end"
        text="OBSTACLE AVOIDANCE"
        a={0.64}
        b={0.93}
        animate={animate}
      />

      {/* Scene captions */}
      <Caption text="MAPPING" a={0} b={0.19} animate={animate} />
      <Caption text="PATH PLANNED" a={0.19} b={0.38} animate={animate} />
      <Caption text="AUTONOMOUS MOVEMENT" a={0.38} b={0.63} animate={animate} />
      <Caption text="OBSTACLE DETECTED" a={0.63} b={0.75} animate={animate} />
      <Caption text="ROUTE UPDATED" a={0.75} b={0.85} animate={animate} />
      <Caption text="NAVIGATION COMPLETE" a={0.85} b={1} animate={animate} />
    </svg>
  );
}

function RobotBody({ lidar }: { lidar: boolean }) {
  return (
    <>
      {lidar ? (
        <>
          <motion.circle
            r={14}
            fill="none"
            stroke={ORANGE}
            strokeWidth={1.5}
            animate={{ r: [10, 34], opacity: [0.7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            r={14}
            fill="none"
            stroke={ORANGE}
            strokeWidth={1.5}
            animate={{ r: [10, 34], opacity: [0.7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          />
        </>
      ) : (
        <circle r={18} fill="none" stroke={ORANGE} strokeWidth={1} opacity={0.18} />
      )}
      <circle r={11} fill={NAVY} />
      <circle r={4} fill={ORANGE} />
    </>
  );
}
