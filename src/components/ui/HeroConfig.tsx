// src/components/ui/HeroConfig.tsx
// Centralized Hero configuration component for easy customization
// This component contains all Hero slides, animations, and settings in one place

"use client";

import { motion } from "framer-motion";
import Hero from "./Hero";

// ==================== HERO ANIMATION VARIANTS ====================
// Customize these variants to change animation behavior

export const heroAnimationVariants = {
  // Container animation for staggered children
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },

  // Individual item animation
  itemVariants: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  },

  // Slide transition animations (dramatic entrance/exit)
  slideVariants: {
    enter: { opacity: 0, x: 300, scale: 0.8 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -300, scale: 0.8 },
  },

  // Background crossfade animation
  backgroundVariants: {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

// ==================== HERO SLIDES CONFIGURATION ====================
// Add, remove, or modify slides here. Each slide supports:
// - title: Main heading text
// - subtitle: Secondary description text
// - buttonText: Call-to-action button text
// - buttonLink: URL for the button
// - backgroundType: "gradient" | "image" | "video" | "none"
// - backgroundImage: Path to image (only for backgroundType: "image")
// - backgroundVideo: Path to video (only for backgroundType: "video")

export const heroSlides = [
  {
    title: "Bienvenido a Next WP Kit",
    subtitle: "Un kit moderno para integrar Next.js con WordPress headless",
    buttonText: "Explorar Recursos",
    buttonLink: "/recursos",
    backgroundType: "image" as const,
    backgroundImage: "/images/hero-bg2.jpg"
  },
  {
    title: "Animaciones Suaves",
    subtitle: "Componentes de animación reutilizables con Framer Motion",
    buttonText: "Ver Animaciones",
    buttonLink: "/animaciones",
    backgroundType: "image" as const,
    backgroundImage: "/images/hero-bg.jpg"
  },
  // {
  //   title: "WordPress Headless",
  //   subtitle: "Integra fácilmente tu contenido de WordPress con Next.js",
  //   buttonText: "Más Info",
  //   buttonLink: "/acerca",
  //   backgroundType: "gradient" as const,
  // }
];

// ==================== HERO SETTINGS ====================
// Global Hero settings - modify these to change behavior

export const heroSettings = {
  // Auto-play settings
  autoPlay: true,
  autoPlayInterval: 8000, // 8 seconds between slides

  // Animation timing (in seconds)
  slideTransitionDuration: 0.8,
  backgroundFadeDuration: 0.8,

  // Easing curves for smooth animations
  slideEasing: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier
  backgroundEasing: "easeInOut" as const,
};

// ==================== HERO COMPONENT ====================
// This is the main component that combines everything
// Use this in your pages instead of the raw Hero component

export default function HeroConfig() {
  return (
    <Hero
      slides={heroSlides}
      autoPlay={heroSettings.autoPlay}
      autoPlayInterval={heroSettings.autoPlayInterval}
    />
  );
}

// ==================== EXPORTED HOOK FOR CUSTOM USAGE ====================
// If you need to use Hero with custom slides in other components

export function useHeroConfig() {
  return {
    slides: heroSlides,
    settings: heroSettings,
    variants: heroAnimationVariants,
  };
}

// ==================== INDIVIDUAL SLIDE COMPONENT ====================
// For creating custom slides with consistent styling

interface HeroSlideProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function HeroSlide({ title, subtitle, buttonText, buttonLink }: HeroSlideProps) {
  return (
    <motion.div
      variants={heroAnimationVariants.containerVariants}
      initial="hidden"
      animate="visible"
    >
      {title && (
        <motion.h1 variants={heroAnimationVariants.itemVariants}>
          {title}
        </motion.h1>
      )}
      {subtitle && (
        <motion.p variants={heroAnimationVariants.itemVariants}>
          {subtitle}
        </motion.p>
      )}
      {buttonText && buttonLink && (
        <motion.div variants={heroAnimationVariants.itemVariants}>
          <a href={buttonLink} className="button hero-button">
            {buttonText}
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}