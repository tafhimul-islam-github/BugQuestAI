import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

interface Scroll3DSectionProps {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
  lift?: number;
}

/**
 * Hardware-accelerated 3D scroll-linked perspective wrapper.
 * Gently pitches sections from a subtle 3D plane into flat alignment as they scroll into view.
 */
export const Scroll3DSection: React.FC<Scroll3DSectionProps> = ({
  children,
  className = '',
  tilt = 7,
  lift = 30,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 32%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.6,
  });

  const rotateX = useTransform(smoothProgress, [0, 1], [tilt, 0]);
  const y = useTransform(smoothProgress, [0, 1], [lift, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [0.97, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.35, 1], [0.5, 0.92, 1]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`perspective-1200 ${className}`}>
      <motion.div
        style={{
          rotateX,
          y,
          scale,
          opacity,
          transformOrigin: 'center top',
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};
