import { ElementType, ReactNode } from 'react';
import { MotionProps } from 'framer-motion';

export type AnimationProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
} & MotionProps;
