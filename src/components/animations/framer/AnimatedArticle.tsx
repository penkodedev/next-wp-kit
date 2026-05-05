"use client";

import { useRef, type ReactNode, ElementType } from 'react';
import { motion, useInView, type MotionProps } from "framer-motion";

type AnimatedArticleProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  amount?: number;
} & MotionProps;

export default function AnimatedArticle({
  children,
  className = "page-content",
  as: Tag = 'article',
  amount = 0,
  ...motionProps
}: AnimatedArticleProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.97 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      {...motionProps}
    >
      {children}
    </MotionTag>
  );
}
