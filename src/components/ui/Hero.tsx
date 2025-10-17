// src/components/ui/Hero.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "./Icons";

type HeroProps = {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  buttonText?: string;
  buttonLink?: string;
};

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  buttonText,
  buttonLink,
}: HeroProps) {

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Anima los hijos con un pequeño retraso entre ellos
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
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="hero-section">
      {/* Capa de fondo para imagen o vídeo */}
      <div className="hero-background">
        {backgroundVideo ? (
          <video src={backgroundVideo} autoPlay loop muted playsInline />
        ) : backgroundImage ? (
          // Usarías next/image aquí si no es un fondo CSS
          <div style={{ backgroundImage: `url(${backgroundImage})` }} />
        ) : null}
        <div className="hero-overlay" />
      </div>

      {/* Contenido animado */}
      <motion.div 
        className="hero-content container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {title && <motion.h1 variants={itemVariants}>{title}</motion.h1>}
        {subtitle && <motion.p variants={itemVariants}>{subtitle}</motion.p>}
        {buttonText && buttonLink && (
          <motion.div variants={itemVariants}>
            <Link href={buttonLink} className="button hero-button">{buttonText} <Icons.ArrowRight /></Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
