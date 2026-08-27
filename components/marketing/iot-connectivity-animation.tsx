'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * IoTConnectivityAnimation — animated device → gateway → cloud diagram.
 *
 * Signal flow: DEVICE → GATEWAY → CLOUD, then an acknowledgement returns
 * CLOUD → DEVICE. All motion is SVG transform / opacity only; the static
 * diagram is fully visible when motion is reduced or paused.
 *
 * Reveal: opacity 0→1, scale 0.985→1 on mount (≈700ms). Device LED pulses,
 * radio arcs appear, a cyan data packet travels device→cloud, the cloud
 * shows SYNCED, an orange acknowledgement returns, and the device shows
 * ONLINE. The full cycle repeats (~8s) after a short idle.
 */
export function IoTConnectivityAnimation() {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 400 250"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Animated IoT connectivity diagram. A field device sends a cyan data packet to a gateway and on to the cloud; the cloud shows SYNCED and an orange acknowledgement returns, after which the device shows ONLINE."
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Connection base lines (visible at rest) */}
      <g fill="none" stroke="var(--tech-line-strong)" strokeWidth={2}>
        <path d="M77 125 H170" />
        <path d="M230 125 H316" />
      </g>

      {/* Radio arcs from device */}
      <g fill="none" stroke="var(--tech-cyan)" strokeWidth={2}>
        <path className="tech-arc-anim" d="M80 114 A14 14 0 0 1 80 136" />
        <path className="tech-arc-anim a2" d="M86 106 A24 24 0 0 1 86 144" />
        <path className="tech-arc-anim a3" d="M92 98 A34 34 0 0 1 92 152" />
      </g>

      {/* Device */}
      <rect
        x={33}
        y={103}
        width={44}
        height={44}
        rx={8}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <circle className="tech-devled-anim" cx={55} cy={125} r={3.5} fill="var(--tech-cyan)" />
      <text
        x={55}
        y={168}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text)',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.1em',
        }}
      >
        DEVICE
      </text>
      <text
        className="tech-online-anim"
        x={55}
        y={92}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-orange)',
          fontSize: 10,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
        }}
      >
        ONLINE
      </text>

      {/* Gateway */}
      <rect
        x={170}
        y={100}
        width={60}
        height={50}
        rx={8}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <text
        x={200}
        y={167}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text)',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.1em',
        }}
      >
        GATEWAY
      </text>

      {/* Cloud */}
      <g fill="var(--tech-panel-bg-2)" stroke="var(--tech-line-strong)" strokeWidth={2}>
        <ellipse cx={350} cy={120} rx={34} ry={20} />
        <rect x={326} y={120} width={48} height={16} rx={6} />
      </g>
      <text
        x={350}
        y={168}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text)',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.1em',
        }}
      >
        CLOUD
      </text>
      <text
        className="tech-cloud-anim"
        x={350}
        y={100}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-cyan)',
          fontSize: 10,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
        }}
      >
        SYNCED
      </text>

      {/* Data packet device → cloud */}
      <g className="tech-up-anim" style={{ opacity: 0 }}>
        <circle cx={0} cy={0} r={6} fill="var(--tech-cyan)" opacity={0.25} />
        <circle cx={0} cy={0} r={3} fill="var(--tech-cyan)" />
      </g>
      {/* Acknowledgement cloud → device */}
      <g className="tech-ack-anim" style={{ opacity: 0 }}>
        <circle cx={0} cy={0} r={5} fill="var(--tech-orange)" opacity={0.3} />
        <circle cx={0} cy={0} r={2.5} fill="var(--tech-orange)" />
      </g>
    </motion.svg>
  );
}
