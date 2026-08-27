'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * PcbSignalAnimation — animated embedded-control PCB diagram.
 *
 * Signal flow: INPUT → MCU (processing) → SENSOR / I/O (control output).
 * All motion is SVG transform / opacity / stroke-dashoffset only; the static
 * diagram is fully visible when motion is reduced or paused.
 *
 * Reveal: opacity 0→1, scale 0.985→1 on mount (≈700ms).
 * Traces draw progressively (stroke-dashoffset). A cyan pulse travels
 * input→MCU, the MCU glows, branches travel MCU→sensor / MCU→I/O, status
 * LEDs illuminate, and a scan highlight crosses every 6s.
 */
export function PcbSignalAnimation() {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 400 250"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Animated embedded-control PCB diagram. A signal enters from the input connector into the MCU, which drives a sensor module and an I/O output block. Orange status LEDs indicate active channels."
      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
    >
      {/* Signal traces (visible at rest, draw on load) */}
      <g fill="none" stroke="var(--tech-line-strong)" strokeWidth={2}>
        <path className="tech-trace d1" pathLength={1} d="M24 125 H170" />
        <path className="tech-trace d2" pathLength={1} d="M235 110 L302 70" />
        <path className="tech-trace d3" pathLength={1} d="M235 140 L302 180" />
        <path className="tech-trace d4" pathLength={1} d="M60 187 V155 H165" />
      </g>

      {/* MCU glow + body */}
      <ellipse
        className="tech-mcu-glow"
        cx={200}
        cy={125}
        rx={52}
        ry={42}
        fill="var(--tech-cyan)"
        opacity={0.18}
      />
      <rect
        x={165}
        y={95}
        width={70}
        height={60}
        rx={6}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <text
        x={200}
        y={129}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text)',
          fontSize: 13,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.1em',
        }}
      >
        MCU
      </text>

      {/* Sensor module */}
      <rect
        x={302}
        y={48}
        width={56}
        height={44}
        rx={5}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <text
        x={330}
        y={72}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text-dim)',
          fontSize: 10,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
        }}
      >
        SENSOR
      </text>

      {/* I/O output */}
      <rect
        x={302}
        y={158}
        width={56}
        height={44}
        rx={5}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <text
        x={330}
        y={182}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text-dim)',
          fontSize: 10,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
        }}
      >
        I/O
      </text>

      {/* Power block */}
      <rect
        x={32}
        y={169}
        width={56}
        height={36}
        rx={5}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />
      <text
        x={60}
        y={191}
        textAnchor="middle"
        style={{
          fill: 'var(--tech-text-dim)',
          fontSize: 10,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.08em',
        }}
      >
        POWER
      </text>

      {/* Input connector */}
      <rect
        x={14}
        y={113}
        width={20}
        height={24}
        rx={3}
        fill="var(--tech-panel-bg-2)"
        stroke="var(--tech-line-strong)"
        strokeWidth={2}
      />

      {/* Status LEDs (orange accents) */}
      <circle className="tech-led-anim" cx={200} cy={103} r={3} fill="var(--tech-orange)" />
      <circle
        className="tech-led-anim"
        cx={330}
        cy={56}
        r={3}
        fill="var(--tech-orange)"
        style={{ animationDelay: '0.4s' }}
      />
      <circle
        className="tech-led-anim"
        cx={330}
        cy={166}
        r={3}
        fill="var(--tech-orange)"
        style={{ animationDelay: '0.8s' }}
      />
      <circle
        className="tech-led-anim"
        cx={60}
        cy={177}
        r={3}
        fill="var(--tech-orange)"
        style={{ animationDelay: '1.2s' }}
      />

      {/* Signal packets (cyan) */}
      <g className="tech-pkt-in" style={{ opacity: 0 }}>
        <circle cx={0} cy={0} r={6} fill="var(--tech-cyan)" opacity={0.25} />
        <circle cx={0} cy={0} r={3} fill="var(--tech-cyan)" />
      </g>
      <g className="tech-pkt-b1" style={{ opacity: 0 }}>
        <circle cx={0} cy={0} r={5} fill="var(--tech-cyan)" opacity={0.25} />
        <circle cx={0} cy={0} r={2.5} fill="var(--tech-cyan)" />
      </g>
      <g className="tech-pkt-b2" style={{ opacity: 0 }}>
        <circle cx={0} cy={0} r={5} fill="var(--tech-cyan)" opacity={0.25} />
        <circle cx={0} cy={0} r={2.5} fill="var(--tech-cyan)" />
      </g>

      {/* Scan highlight */}
      <rect
        className="tech-scan-anim"
        x={10}
        y={20}
        width={2}
        height={210}
        fill="var(--tech-cyan)"
        opacity={0}
      />
    </motion.svg>
  );
}
