// src/components/ui/Hero.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "../ui/Icons";
import { useHeroConfig } from "./HeroConfig";

type HeroSlide = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundType?: 'gradient' | 'image' | 'video' | 'none';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  videoPlaybackRate?: number;
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
  const [isClient, setIsClient] = useState(false);

  // Detectar cuando estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-play functionality - solo en cliente para evitar hydration mismatch
  useEffect(() => {
    if (isClient && autoPlay && heroSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isClient, autoPlay, autoPlayInterval, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Use centralized animation variants from HeroConfig
  const { variants: heroVariants } = useHeroConfig();
  const containerVariants = heroVariants.containerVariants;
  const itemVariants = heroVariants.itemVariants;
  const slideVariants = heroVariants.slideVariants;

  const currentSlideData = heroSlides[currentSlide];
  const backgroundType = currentSlideData?.backgroundType || 'gradient';

  return (
    <section className="hero-section">
      {/* Capa de fondo dinámica con crossfade */}
      <div className={`hero-background hero-background-${backgroundType}`}>
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hero-background-slide"
          >
            {backgroundType === 'image' && currentSlideData?.backgroundImage && (
              <Image
                src={currentSlideData.backgroundImage}
                alt="Hero background"
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            )}
            {backgroundType === 'video' && currentSlideData?.backgroundVideo && (
              <video
                ref={(video) => {
                  if (video && currentSlideData.videoPlaybackRate) {
                    video.playbackRate = currentSlideData.videoPlaybackRate;
                  }
                }}
                src={currentSlideData.backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                // Styles moved to hero-home.scss for consistency
              />
            )}
            {backgroundType === 'none' && currentSlideData?.backgroundColor && (
              <div style={{ backgroundColor: currentSlideData.backgroundColor, width: '100%', height: '100%' }} />
            )}
          </motion.div>
        </AnimatePresence>
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
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94], // Cubic bezier para más suavidad
              scale: { duration: 0.6 },
              opacity: { duration: 0.4 }
            }}
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

      {/* Botón de scroll hacia abajo */}
      <a
        href="#index-home"
        className="hero-nav hero-nav-down"
        aria-label="Scroll hacia abajo"
        onClick={(e) => {
          e.preventDefault();
          const target = document.getElementById('index-home');
          if (target) {
            const start = window.scrollY;
            const targetTop = target.offsetTop;
            const distance = targetTop - start;
            const duration = 1000; // Más alto = más lento
            const startTime = performance.now();

            const animateScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

              window.scrollTo(0, start + distance * ease);

              if (progress < 1) {
                requestAnimationFrame(animateScroll);
              }
            };

            requestAnimationFrame(animateScroll);
          }
        }}
      >
        <Icons.ChevronDown size={18} />
      </a>
    </section>
  );
}
