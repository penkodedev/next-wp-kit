// src/components/sections/Hero.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "../ui/Icons";
import { useHeroConfig } from "./HeroConfig";
import { decodeHTML, normalizeHeroSlide } from "@/utils/wordpress/heroHelpers";
import type { HeroSlide as APIHeroSlide } from "@/api/wordpressApi";

type ContentPosition = 'top' | 'center' | 'bottom';
type ContentAlign = 'left' | 'center' | 'right';

type NormalizedHeroSlide = {
  title?: string;
  titleAlign?: 'left' | 'center' | 'right';
  subtitle?: string;
  contentPosition?: ContentPosition;
  contentAlign?: ContentAlign;
  overlayOpacity?: number;
  overlayColor?: string;
  kenBurns?: number;
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: 'default' | 'outline';
  backgroundType?: 'gradient' | 'image' | 'video' | 'none';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  videoPlaybackRate?: number;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  vignetteMode?: 'none' | 'round' | 'up' | 'down';
  vignetteColor?: string;
  vignetteIntensity?: number;
  vignetteSize?: number;
};

type HeroSlide = {
  title?: string;
  title_align?: 'left' | 'center' | 'right';
  subtitle?: string;
  content_position?: ContentPosition;
  content_align?: ContentAlign;
  overlay_opacity?: number;
  overlay_color?: string;
  ken_burns?: number;
  buttonText?: string;
  button_text?: string;
  buttonLink?: string;
  button_link?: string;
  button_style?: 'default' | 'outline';
  backgroundType?: 'gradient' | 'image' | 'video' | 'none';
  background_type?: 'gradient' | 'image' | 'video' | 'none';
  backgroundImage?: string;
  background_image?: string;
  backgroundVideo?: string;
  background_video?: string;
  backgroundColor?: string;
  videoPlaybackRate?: number;
  video_playback_rate?: number;
  gradient_color_1?: string;
  gradient_color_2?: string;
  gradient_direction?: string;
  vignette_mode?: 'none' | 'round' | 'up' | 'down';
  vignette_color?: string;
  vignette_intensity?: number;
  vignette_size?: number;
};

type HeroProps = {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonLink?: string;
  slides?: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const contentPositionMap: Record<ContentPosition, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

const contentAlignMap: Record<ContentAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const textAlignMap: Record<ContentAlign, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
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
  const heroSlides = slides || (title || subtitle || buttonText ? [{ title, subtitle, buttonText, buttonLink }] : []);
  const normalizedSlides = useMemo(() => heroSlides.map(normalizeHeroSlide) as NormalizedHeroSlide[], [heroSlides]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const enableVideo = () => {
      if (!cancelled) setAllowVideo(true);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enableVideo, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id as number);
      };
    }

    if (typeof window !== 'undefined') {
      const t = setTimeout(enableVideo, 200);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
  }, []);

  useEffect(() => {
    if (autoPlay && normalizedSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % normalizedSlides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, normalizedSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % normalizedSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + normalizedSlides.length) % normalizedSlides.length);
  };

  const { variants: heroVariants } = useHeroConfig();
  const containerVariants = heroVariants.containerVariants;
  const itemVariants = heroVariants.itemVariants;
  const slideVariants = heroVariants.slideVariants;

  const currentSlideData = normalizedSlides[currentSlide];

  const bgType = (currentSlideData?.backgroundType || 'gradient') as 'gradient' | 'image' | 'video' | 'none';
  const bgImage = currentSlideData?.backgroundImage;
  const bgVideo = currentSlideData?.backgroundVideo;
  const playbackRate = currentSlideData?.videoPlaybackRate || 1;
  const gradientColor1 = currentSlideData?.gradientColor1 || '#6366f1';
  const gradientColor2 = currentSlideData?.gradientColor2 || '#8b5cf6';
  const gradientDirection = currentSlideData?.gradientDirection || 'to bottom';

  const contentPosition = currentSlideData?.contentPosition || 'center';
  const contentAlign = currentSlideData?.contentAlign || 'center';

  return (
    <section className="hero-section">
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
                className={currentSlideData?.kenBurns ? 'ken-burns-active' : ''}
                priority
              />
            )}
            {bgType === 'video' && bgVideo && allowVideo && (
              <video
                ref={(video) => {
                  if (video && playbackRate) {
                    video.playbackRate = playbackRate;
                  }
                }}
                src={bgVideo}
                preload="metadata"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            {bgType === 'none' && currentSlideData?.backgroundColor && (
              <div style={{ backgroundColor: currentSlideData.backgroundColor, width: '100%', height: '100%' }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="hero-overlay"
        style={{
          backgroundColor: currentSlideData?.overlayColor ?? '#000000',
          opacity: currentSlideData?.overlayOpacity ?? 0.3
        }}
      />

      {currentSlideData?.vignetteMode && currentSlideData.vignetteMode !== 'none' && (
        <div
          className={`hero-vignette hero-vignette--${currentSlideData.vignetteMode}`}
          style={{
            '--vignette-color': currentSlideData.vignetteColor ?? '#000000',
            '--vignette-intensity': currentSlideData.vignetteIntensity ?? 0.5,
            '--vignette-size': `${currentSlideData.vignetteSize ?? 50}%`,
          } as React.CSSProperties}
        />
      )}

      <div
        className="hero-content"
        style={{
          justifyContent: contentPositionMap[contentPosition],
          alignItems: contentAlignMap[contentAlign],
          textAlign: textAlignMap[contentAlign] as 'left' | 'center' | 'right',
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
              ease: [0.25, 0.46, 0.45, 0.94],
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
              {currentSlideData?.title && (
                <motion.h1
                  variants={itemVariants}
                  style={{ textAlign: currentSlideData.titleAlign || 'left' }}
                >
                  {currentSlideData.title}
                </motion.h1>
              )}
              {currentSlideData?.subtitle && (
                <motion.div
                  variants={itemVariants}
                  dangerouslySetInnerHTML={{
                    __html: decodeHTML(currentSlideData.subtitle)
                  }}
                />
              )}
              {currentSlideData?.buttonText && currentSlideData?.buttonLink && (
                <motion.div variants={itemVariants}>
                  <Link
                    href={currentSlideData.buttonLink}
                    className={`button hero-button hero-button-${currentSlideData.buttonStyle || 'primary'}`}
                  >
                    {currentSlideData.buttonText} <Icons.ArrowRight size={21} strokeWidth={1.5} />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {normalizedSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="hero-nav hero-nav-prev"
            aria-label="Slide anterior"
          >
            <Icons.ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="hero-nav hero-nav-next"
            aria-label="Slide siguiente"
          >
            <Icons.ChevronRight size={18} />
          </button>
        </>
      )}

      <a
        href="#index-home"
        className="hero-nav hero-nav-down"
        aria-label="Scroll hacia abajo"
        onClick={(e) => {
          e.preventDefault();
          const target = document.getElementById('index-home');
          if (!target) return;
          const start = window.scrollY;
          const targetTop = target.offsetTop;
          const distance = targetTop - start;
          const duration = 1000;
          const startTime = performance.now();

          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, start + distance * ease);
            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);
        }}
      >
        <Icons.ArrowDown size={22} strokeWidth={1.5} />
      </a>
    </section>
  );
}
