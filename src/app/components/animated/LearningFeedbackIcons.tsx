import { LazyMotion, domMin, m, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type AnimatedFeedbackIconProps = {
  size?: number;
  className?: string;
  color?: string;
};

type CorrectCelebrationProps = {
  show: boolean;
  combo: number;
  reward: number;
};

function IconShell({ children, className, color }: AnimatedFeedbackIconProps & { children: ReactNode }) {
  return (
    <span className={`inline-flex items-center justify-center ${className || ''}`} style={{ color }}>
      {children}
    </span>
  );
}

// Path data adapted from AnimateIcons lucide icons, MIT licensed.
export function AnimatedSuccessSvg({ size = 24, className, color = 'currentColor' }: AnimatedFeedbackIconProps) {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domMin} strict>
      <IconShell className={className} color={color}>
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { scale: 0.78, rotate: -8 }}
          animate={reduced ? undefined : { scale: [0.78, 1.16, 0.96, 1], rotate: [-8, 3, 0, 0] }}
          transition={{ duration: 0.52, ease: 'easeOut' }}
        >
          <m.path
            d="M21.801 10A10 10 0 1 1 17 3.335"
            initial={reduced ? false : { pathLength: 0.66, opacity: 0.7 }}
            animate={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          />
          <m.path
            d="m9 11 3 3L22 4"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.14, ease: 'easeOut' }}
          />
        </m.svg>
      </IconShell>
    </LazyMotion>
  );
}

export function AnimatedComboSvg({ size = 24, className, color = 'currentColor' }: AnimatedFeedbackIconProps) {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domMin} strict>
      <IconShell className={className} color={color}>
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.08, 1.02, 1], y: [0, -2, -1, 0], rotate: [0, -2, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.15, ease: 'easeInOut' }}
        >
          <m.path
            d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
            style={{ strokeDasharray: 120 }}
            animate={reduced ? undefined : { strokeDashoffset: [0, -40, 0] }}
            transition={{ duration: 1.05, repeat: Infinity, ease: 'linear' }}
          />
        </m.svg>
      </IconShell>
    </LazyMotion>
  );
}

export function AnimatedRewardSvg({ size = 24, className, color = 'currentColor' }: AnimatedFeedbackIconProps) {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domMin} strict>
      <IconShell className={className} color={color}>
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { scale: 0.84, rotate: -10 }}
          animate={reduced ? undefined : { scale: [0.84, 1.22, 0.96, 1.04, 1], rotate: [-10, 8, -4, 0] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <m.path
            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          />
          <m.path
            d="M20 2v4M22 4h-4"
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={reduced ? undefined : { opacity: [0, 1, 0.85], scale: [0.5, 1.1, 1] }}
            transition={{ duration: 0.48, delay: 0.18, ease: 'easeOut' }}
          />
        </m.svg>
      </IconShell>
    </LazyMotion>
  );
}

const celebrationParticles = [
  { x: '-36vw', y: '-18vh', rotate: -32, delay: 0.02, color: '#FDE047' },
  { x: '-24vw', y: '22vh', rotate: 18, delay: 0.08, color: '#34D399' },
  { x: '-10vw', y: '-30vh', rotate: 54, delay: 0.12, color: '#60A5FA' },
  { x: '16vw', y: '-28vh', rotate: -18, delay: 0.04, color: '#F472B6' },
  { x: '32vw', y: '18vh', rotate: 35, delay: 0.1, color: '#FDBA74' },
  { x: '38vw', y: '-8vh', rotate: -52, delay: 0.16, color: '#A78BFA' },
  { x: '-42vw', y: '4vh', rotate: 71, delay: 0.14, color: '#2DD4BF' },
  { x: '4vw', y: '30vh', rotate: -25, delay: 0.06, color: '#FACC15' },
];

export function CorrectCelebrationOverlay({ show, combo, reward }: CorrectCelebrationProps) {
  const reduced = useReducedMotion();
  if (!show) return null;

  return (
    <LazyMotion features={domMin} strict>
      <m.div
        className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.12 }}
      >
        <m.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 42%, rgba(74, 222, 128, 0.42) 0%, rgba(20, 184, 166, 0.22) 38%, rgba(14, 165, 233, 0.08) 68%, transparent 100%)',
          }}
          initial={reduced ? false : { scale: 0.7 }}
          animate={reduced ? undefined : { scale: [0.7, 1.1, 1.18] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />

        {celebrationParticles.map((particle, index) => (
          <m.span
            key={`${particle.x}-${index}`}
            className="absolute left-1/2 top-1/2 h-4 w-4 rounded-[5px]"
            style={{ background: particle.color }}
            initial={reduced ? false : { x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 0 }}
            animate={reduced ? undefined : { x: particle.x, y: particle.y, rotate: particle.rotate, scale: [0.4, 1.2, 0.85], opacity: [0, 1, 0] }}
            transition={{ duration: 1.05, delay: particle.delay, ease: 'easeOut' }}
          />
        ))}

        <m.div
          className="relative flex flex-col items-center"
          initial={reduced ? false : { scale: 0.58, y: 26, opacity: 0 }}
          animate={reduced ? undefined : { scale: [0.58, 1.08, 0.98, 1], y: [26, -10, 0], opacity: 1 }}
          transition={{ duration: 0.54, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex h-[148px] w-[148px] items-center justify-center rounded-full border-[8px] border-white bg-emerald-400 text-white shadow-[0_18px_0_rgba(5,150,105,0.22),0_24px_52px_rgba(15,23,42,0.22)] md:h-[188px] md:w-[188px]">
            <AnimatedSuccessSvg size={96} className="md:[&>svg]:h-[124px] md:[&>svg]:w-[124px]" />
          </div>

          <m.div
            className="mt-5 rounded-[30px] border-4 border-white bg-white px-7 py-3 text-center shadow-[0_10px_0_rgba(15,23,42,0.12)]"
            initial={reduced ? false : { y: 12, opacity: 0 }}
            animate={reduced ? undefined : { y: 0, opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.16 }}
          >
            <div className="text-emerald-600" style={{ fontSize: 'clamp(34px, 9vw, 56px)', fontWeight: 900, lineHeight: 1 }}>
              答对了
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-slate-600" style={{ fontSize: '16px', fontWeight: 900 }}>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">+1 星星</span>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">+{reward}</span>
              {combo > 1 && <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">连击 x{combo}</span>}
            </div>
          </m.div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
