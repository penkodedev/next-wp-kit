"use client";

import { useRef, type ReactNode, ElementType } from 'react';
import { motion, useInView, type MotionProps } from "framer-motion";

type AnimatedFadeInProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  amount?: number; // Cuánto del elemento debe estar visible para animar (0 a 1)
  once?: boolean; // Si la animación ocurre solo una vez
} & MotionProps; // Permite pasar cualquier prop de framer-motion (initial, animate, etc.)

export default function AnimatedFadeIn({
  children,
  className,
  as: Tag = 'div',
  amount = 0,
  once = true,
  ...motionProps
}: AnimatedFadeInProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount });

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: once, amount: amount }}
      transition={{ duration: 0.5, ease: "easeOut"}}

      {...motionProps} // Sobrescribe las animaciones por defecto si es necesario
    >
      {children}
    </MotionTag>
  );
}
