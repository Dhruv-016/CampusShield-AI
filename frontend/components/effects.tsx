"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  TiltCard                                                          */
/*  3D tilt effect following mouse with glare overlay.                */
/* ------------------------------------------------------------------ */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Smooth springs for buttery animation
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // rotateX is inverted so top-tilt feels natural
      rotateX.set((y - 0.5) * -intensity);
      rotateY.set((x - 0.5) * intensity);
      glareX.set(x * 100);
      glareY.set(y * 100);
    },
    [intensity, rotateX, rotateY, glareX, glareY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [rotateX, rotateY, glareX, glareY]);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {/* Glare / shine overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.12) 0%, transparent 60%)`
          ),
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  MagneticButton                                                    */
/*  Button that magnetically pulls toward the cursor on hover.        */
/* ------------------------------------------------------------------ */

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  as?: "button" | "a";
  href?: string;
  onClick?: (e: React.MouseEvent<any>) => void;
  [key: string]: any;
}

export function MagneticButton({
  children,
  className,
  as = "button",
  href,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * 0.3);
      y.set((e.clientY - centerY) * 0.3);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (as === "a") {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        href={href}
        style={{ x: springX, y: springY }}
        {...rest}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  GradientText                                                      */
/*  Text with an animated gradient background-clip.                   */
/* ------------------------------------------------------------------ */

interface GradientTextProps {
  children: React.ReactNode;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
}

export function GradientText({
  children,
  as: Tag = "span",
  className = "",
}: GradientTextProps) {
  return (
    <Tag
      className={`inline-block bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto] ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  SpotlightCard                                                     */
/*  Card with a cursor-following spotlight glow effect on the border. */
/* ------------------------------------------------------------------ */

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Spotlight glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([mx, my]) =>
              `radial-gradient(400px circle at ${mx}px ${my}px, rgba(99,102,241,0.15), transparent 60%)`
          ),
        }}
      />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FloatingElement                                                   */
/*  CSS animated floating element.                                    */
/* ------------------------------------------------------------------ */

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export function FloatingElement({
  children,
  className = "",
  amplitude = 12,
  duration = 4,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlowOrb                                                          */
/*  Decorative gradient orb with blur and float animation.            */
/* ------------------------------------------------------------------ */

interface GlowOrbProps {
  className?: string;
  color?: "brand" | "violet" | "cyan";
}

const orbColors: Record<string, string> = {
  brand: "from-brand-500/30 to-brand-700/10",
  violet: "from-violet-500/30 to-violet-700/10",
  cyan: "from-cyan-500/30 to-cyan-700/10",
};

export function GlowOrb({ className = "", color = "brand" }: GlowOrbProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-br blur-3xl ${orbColors[color]} ${className}`}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedGradientBorder                                            */
/*  Element wrapped with a rotating animated gradient border.         */
/* ------------------------------------------------------------------ */

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientBorder({
  children,
  className = "",
}: AnimatedGradientBorderProps) {
  return (
    <div className={`relative rounded-2xl p-px ${className}`}>
      {/* Animated conic gradient border */}
      <div
        className="absolute inset-0 rounded-2xl animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
          borderRadius: "inherit",
        }}
      />
      {/* Inner content */}
      <div className="relative rounded-2xl">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee                                                           */
/*  Infinite horizontal scrolling marquee.                            */
/* ------------------------------------------------------------------ */

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className = "",
  speed = 40,
  reverse = false,
  pauseOnHover = true,
}: MarqueeProps) {
  const direction = reverse ? "reverse" : "normal";

  return (
    <div
      className={`group flex overflow-hidden ${className}`}
      style={
        {
          "--marquee-duration": `${speed}s`,
          "--marquee-direction": direction,
        } as React.CSSProperties
      }
    >
      {/* First copy */}
      <div
        className={`flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4 ${
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction,
        }}
      >
        {children}
      </div>
      {/* Duplicate for seamless loop */}
      <div
        className={`flex min-w-full shrink-0 animate-marquee items-center justify-around gap-4 ${
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction,
        }}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TypewriterText                                                    */
/*  Typewriter text reveal effect.                                    */
/* ------------------------------------------------------------------ */

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function TypewriterText({
  text,
  className = "",
  speed = 50,
  delay = 0,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Trigger when element enters viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let idx = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        idx++;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [started, text, speed, delay]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-current align-middle animate-blink ml-px" />
      )}
    </span>
  );
}
