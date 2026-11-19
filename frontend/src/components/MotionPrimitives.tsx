import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export const PageReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerList: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.05 }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
      },
    }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const InteractiveCard: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);
