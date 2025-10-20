// src/components/ui/Hero.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "./Icons";

type HeroSlide = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundType?: 'gradient' | 'image' | 'video' | 'none';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
};

type HeroProps = {
  // Single slide (backward compatibility)
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonLink?: string;
  // Multiple slides
  slides?: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  buttonText,
  buttonLink,
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
}: HeroProps) {
  // Determinar si usar slides o props individuales
  const heroSlides = slides || (title || subtitle || buttonText ? [{ title, subtitle, buttonText, buttonLink }] : []);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const slideVariants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const currentSlideData = heroSlides[currentSlide];
  const backgroundType = currentSlideData?.backgroundType || 'gradient';

  return (
    <section className="hero-section">
      {/* Capa de fondo dinámica */}
      <div className={`hero-background hero-background-${backgroundType}`}>
        {backgroundType === 'image' && currentSlideData?.backgroundImage && (
          <Image
            src={currentSlideData.backgroundImage}
            alt="Hero background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        )}
        {backgroundType === 'video' && currentSlideData?.backgroundVideo && (
          <video
            src={currentSlideData.backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        {backgroundType === 'none' && currentSlideData?.backgroundColor && (
          <div style={{ backgroundColor: currentSlideData.backgroundColor, width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="hero-overlay" />

      {/* Contenido animado con slides */}
      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="hero-slide"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {heroSlides[currentSlide]?.title && (
                <motion.h1 variants={itemVariants}>
                  {heroSlides[currentSlide].title}
                </motion.h1>
              )}
              {heroSlides[currentSlide]?.subtitle && (
                <motion.p variants={itemVariants}>
                  {heroSlides[currentSlide].subtitle}
                </motion.p>
              )}
              {heroSlides[currentSlide]?.buttonText && heroSlides[currentSlide]?.buttonLink && (
                <motion.div variants={itemVariants}>
                  <Link href={heroSlides[currentSlide].buttonLink!} className="button hero-button">
                    {heroSlides[currentSlide].buttonText} <Icons.ArrowRight size={21} strokeWidth={1.5} />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles de navegación si hay múltiples slides */}
      {heroSlides.length > 1 && (
        <>
          <a
            onClick={prevSlide}
            className="hero-nav hero-nav-prev"
            aria-label="Slide anterior"
          >
            <Icons.ChevronLeft size={18} />
          </a>
          <a
            onClick={nextSlide}
            className="hero-nav hero-nav-next"
            aria-label="Slide siguiente"
          >
            <Icons.ChevronRight size={18} />
          </a>
        </>
      )}
    </section>
  );
}
