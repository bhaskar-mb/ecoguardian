import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const AnimatedBackground: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tracking
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D transformations
  const rotateX = useTransform(smoothY, [0, windowSize.height], [5, -5]);
  const rotateY = useTransform(smoothX, [0, windowSize.width], [-5, 5]);

  // Parallax layers
  const layer1X = useTransform(smoothX, [0, windowSize.width], [20, -20]);
  const layer1Y = useTransform(smoothY, [0, windowSize.height], [20, -20]);

  const layer2X = useTransform(smoothX, [0, windowSize.width], [-30, 30]);
  const layer2Y = useTransform(smoothY, [0, windowSize.height], [-30, 30]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#f8fafc]">
      {/* Perspective Container */}
      <motion.div 
        style={{ 
          perspective: 1000,
          rotateX,
          rotateY,
          width: '100%',
          height: '100%'
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Layer 1: Background Image (Main Landscape) */}
        <motion.div
           style={{ 
             x: layer1X, 
             y: layer1Y,
             scale: 1.1,
             translateZ: -50
           }}
           className="absolute inset-[-10%] opacity-40 blur-[2px]"
        >
          <img 
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Nature Background"
          />
        </motion.div>

        {/* Layer 2: Secondary Image (Foliage/Texture) */}
        <motion.div
           style={{ 
             x: layer2X, 
             y: layer2Y,
             scale: 1.2,
             translateZ: 50
           }}
           className="absolute inset-[-15%] opacity-30 mix-blend-overlay"
        >
          <img 
            src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2560&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Environmental Texture"
          />
        </motion.div>

        {/* 3D Floating Particles/Leaves */}
        {[...Array(20)].map((_, i) => (
          <FloatingElement key={i} index={i} smoothX={smoothX} smoothY={smoothY} windowSize={windowSize} />
        ))}

        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-transparent to-emerald-50/40" />
      </motion.div>

      {/* Static vignettes for focus */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] pointer-events-none" />
    </div>
  );
};

const FloatingElement: React.FC<{ index: number, smoothX: any, smoothY: any, windowSize: any }> = ({ index, smoothX, smoothY, windowSize }) => {
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;
  const size = Math.random() * 30 + 10;
  const speed = Math.random() * 0.08 + 0.02;
  const depth = Math.random() * 300 - 150;
  const delay = Math.random() * 5;
  const duration = Math.random() * 15 + 15;

  const x = useTransform(smoothX, [0, windowSize.width], [initialX - speed * 50, initialX + speed * 50]);
  const y = useTransform(smoothY, [0, windowSize.height], [initialY - speed * 50, initialY + speed * 50]);

  return (
    <motion.div
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        x,
        y,
        translateZ: depth,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0], 
        scale: [0.8, 1.2, 0.8],
        rotate: [0, 360],
        filter: index % 2 === 0 ? 'blur(10px)' : 'blur(20px)'
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
      className={`absolute rounded-full ${index % 3 === 0 ? 'bg-emerald-400/30' : index % 3 === 1 ? 'bg-indigo-400/20' : 'bg-cyan-400/20'}`}
    />
  );
}

export default AnimatedBackground;
