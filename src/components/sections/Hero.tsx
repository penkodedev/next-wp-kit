// src/components/sections/Hero.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "../ui/Icons";
import { useHeroConfig } from "./HeroConfig";
import type { HeroSlide as APIHeroSlide } from "@/api/wordpressApi";

// Local type for backward compatibility + WordPress API support
type HeroSlide = {
  title?: string;
  title_align?: 'left' | 'center' | 'right';
  subtitle?: string;
  content_position?: 'top' | 'center' | 'bottom';
  content_align?: 'left' | 'center' | 'right';
  overlay_opacity?: number;
  ken_burns?: number;
  buttonText?: string;
  button_text?: string; // WordPress uses snake_case
  buttonLink?: string;
  button_link?: string; // WordPress uses snake_case
  button_style?: 'default' | 'outline';
  backgroundType?: 'gradient' | 'image' | 'video' | 'none';
  background_type?: 'gradient' | 'image' | 'video' | 'none'; // WordPress uses snake_case
  backgroundImage?: string;
  background_image?: string; // WordPress uses snake_case
  backgroundVideo?: string;
  background_video?: string; // WordPress uses snake_case
  backgroundColor?: string;
  videoPlaybackRate?: number;
  video_playback_rate?: number; // WordPress uses snake_case
  gradient_color_1?: string;
  gradient_color_2?: string;
  gradient_direction?: string;
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
  
  // Helper para decodificar HTML entities (WordPress escapa el HTML en JSON)
  const decodeHTML = (html: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };
  
  // Normalize WordPress snake_case to camelCase for easier use
  const bgType = (currentSlideData?.background_type || currentSlideData?.backgroundType || 'gradient') as 'gradient' | 'image' | 'video' | 'none';
  const bgImage = currentSlideData?.background_image || currentSlideData?.backgroundImage;
  const bgVideo = currentSlideData?.background_video || currentSlideData?.backgroundVideo;
  const playbackRate = currentSlideData?.video_playback_rate || currentSlideData?.videoPlaybackRate || 1;
  const gradientColor1 = currentSlideData?.gradient_color_1 || '#6366f1';
  const gradientColor2 = currentSlideData?.gradient_color_2 || '#8b5cf6';
  const gradientDirection = currentSlideData?.gradient_direction || 'to bottom';

  return (
    <section className="hero-section">
      {/* Capa de fondo dinámica con crossfade */}
      <div className={`hero-background hero-background-${bgType}`}>
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="hero-background-slide"
            style={bgType === 'gradient' ? {
              background: `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`
            } : undefined}
          >
            {bgType === 'image' && bgImage && (
              <Image
                src={bgImage}
                alt="Hero background"
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                className={currentSlideData?.ken_burns ? 'ken-burns-active' : ''}
                priority
              />
            )}
            {bgType === 'video' && bgVideo && (
              <video
                ref={(video) => {
                  if (video && playbackRate) {
                    video.playbackRate = playbackRate;
                  }
                }}
                src={bgVideo}
                autoPlay
                loop
                muted
                playsInline
                // Styles moved to hero-home.scss for consistency
              />
            )}
            {bgType === 'none' && currentSlideData?.backgroundColor && (
              <div style={{ backgroundColor: currentSlideData.backgroundColor, width: '100%', height: '100%' }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Overlay con opacidad dinámica */}
      <div 
        className="hero-overlay" 
        style={{ 
          opacity: currentSlideData?.overlay_opacity ?? 0.3 
        }} 
      />

      {/* Contenido animado con slides */}
      <div 
        className="hero-content"
        style={{
          justifyContent: currentSlideData?.content_position === 'top' ? 'flex-start' 
                        : currentSlideData?.content_position === 'bottom' ? 'flex-end' 
                        : 'center',
          alignItems: currentSlideData?.content_align === 'left' ? 'flex-start'
                    : currentSlideData?.content_align === 'right' ? 'flex-end'
                    : 'center',
          textAlign: (currentSlideData?.content_align || 'center') as 'left' | 'center' | 'right'
        }}
      >
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
                <motion.h1 
                  variants={itemVariants}
                  style={{ 
                    textAlign: (heroSlides[currentSlide].title_align || 'left') as 'left' | 'center' | 'right' 
                  }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>
              )}
              {heroSlides[currentSlide]?.subtitle && isClient && (
                <motion.div 
                  variants={itemVariants}
                  dangerouslySetInnerHTML={{ 
                    __html: decodeHTML(heroSlides[currentSlide].subtitle || '') 
                  }}
                />
              )}
              {(heroSlides[currentSlide]?.buttonText || heroSlides[currentSlide]?.button_text) && 
               (heroSlides[currentSlide]?.buttonLink || heroSlides[currentSlide]?.button_link) && (
                <motion.div variants={itemVariants}>
                  <Link 
                    href={(heroSlides[currentSlide].button_link || heroSlides[currentSlide].buttonLink)!} 
                    className={`button hero-button hero-button-${heroSlides[currentSlide].button_style || 'primary'}`}
                  >
                    {heroSlides[currentSlide].button_text || heroSlides[currentSlide].buttonText} <Icons.ArrowRight size={21} strokeWidth={1.5} />
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
