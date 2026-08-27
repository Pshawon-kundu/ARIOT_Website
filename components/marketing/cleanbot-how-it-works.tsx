'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { SectionHeader } from '@/components/marketing/section-header';

const EASE = [0.19, 1, 0.22, 1] as const;

const STEPS = [
  { n: '01', title: 'Assign', body: 'Set the cleaning area and schedule from the dashboard.' },
  { n: '02', title: 'Map', body: 'Build a map of the operating area on first deployment.' },
  { n: '03', title: 'Clean', body: 'Navigate autonomously and avoid obstacles in real time.' },
  { n: '04', title: 'Monitor', body: 'Track coverage, battery, and status from anywhere.' },
] as const;

/**
 * CleanBotHowItWorks — scroll-driven storytelling for the real ARIoT product
 * (cleanbot-how-it-works spec §13/§16/§17). Uses only existing product copy;
 * no invented capabilities. The active step turns ARIoT orange as it enters
 * view, completed steps stay navy, and a top-down facility route draws in
 * with an orange progress stroke. Reduced motion shows the final state.
 */
export function CleanBotHowItWorks() {
  const reduce = useReducedMotion();
  const stepReveal = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true } }
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-15%' },
          transition: { duration: 0.5, ease: EASE, delay: i * 0.08 },
        };

  return (
    <Section bg="base" spacing="default">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="ARIoT CleanBot"
          title="How CleanBot works"
          subhead="A simple autonomous loop — assign, map, clean, and monitor. The same engineering that powers our robotics platform, in a real product."
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* Steps */}
          <ol className="flex flex-col gap-5">
            {STEPS.map((step, i) => (
              <motion.li key={step.n} className="flex items-start gap-4" {...stepReveal(i)}>
                <span className="brand-node mt-2" aria-hidden />
                <div className="flex flex-col gap-1">
                  <p className="text-steel-500 font-mono text-xs font-medium tracking-[0.18em] uppercase">
                    <span className="text-brand-orange">{step.n}</span> · {step.title}
                  </p>
                  <p className="text-steel-200 text-sm">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Top-down facility route */}
          <div className="border-steel-800 bg-bg-raised relative overflow-hidden rounded-2xl border p-6">
            <svg
              viewBox="0 0 320 220"
              className="h-auto w-full"
              role="img"
              aria-label="Top-down facility map with autonomous cleaning route"
            >
              {/* Facility structure — navy */}
              <rect
                x="12"
                y="12"
                width="296"
                height="196"
                rx="10"
                fill="none"
                stroke="var(--steel-600)"
                strokeWidth="2"
                opacity="0.6"
              />
              <rect
                x="48"
                y="48"
                width="100"
                height="70"
                rx="6"
                fill="none"
                stroke="var(--steel-600)"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <rect
                x="180"
                y="110"
                width="90"
                height="64"
                rx="6"
                fill="none"
                stroke="var(--steel-600)"
                strokeWidth="1.5"
                opacity="0.5"
              />
              {/* Route — orange, draws in on view */}
              <motion.path
                d="M40 180 L40 120 L150 120 L150 70 L240 70 L240 150 L280 150"
                fill="none"
                stroke="var(--brand-orange)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              />
              {/* Robot position marker */}
              <circle cx="40" cy="180" r="5" fill="var(--brand-orange)" />
              <circle cx="280" cy="150" r="5" fill="var(--brand-orange)" />
            </svg>
            <p className="text-steel-500 mt-3 font-mono text-[10px] tracking-[0.16em] uppercase">
              Autonomous coverage route
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
