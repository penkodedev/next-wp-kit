// src/lib/gsap.ts

// GLOBAL SETUP for GSAP library.
// This avoid to register the plugin a thousand times around the project.
// USAGE: import { gsap, ScrollTrigger } from '@/animations/gsap'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
}

export { gsap, ScrollTrigger, ScrollSmoother }
