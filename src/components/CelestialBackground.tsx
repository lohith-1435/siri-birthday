import React, { useEffect, useRef } from 'react';

interface CelestialBackgroundProps {
  sceneIndex: number;
  interactive?: boolean;
}

export const CelestialBackground: React.FC<CelestialBackgroundProps> = ({ sceneIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create luxury gold particles
    const particleCount = Math.min(180, Math.floor((width * height) / 10000));
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      baseAlpha: number;
      color: string;
      pulseSpeed: number;
      pulseAngle: number;
    }> = [];

    const goldColors = [
      'rgba(255, 248, 220, ', // Champagne
      'rgba(212, 175, 55, ',  // Metallic Gold
      'rgba(243, 229, 171, ', // Vanilla Gold
      'rgba(197, 160, 89, ',  // Antique Gold
      'rgba(230, 202, 101, ', // Radiant Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.7 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.1, // gently float upward like sacred embers
        alpha: baseAlpha,
        baseAlpha,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
      });
    }

    // Fixed background stars
    const starCount = 120;
    const stars: Array<{ x: number; y: number; size: number; alpha: number; flicker: number }> = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        flicker: Math.random() * 0.02 + 0.005,
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep celestial radial gradient based on scene
      let gradCenterY = height * 0.5;
      let innerColor = 'rgba(15, 12, 22, 0.4)';
      let outerColor = '#030305';

      if (sceneIndex === 4) {
        // Divine blessing - subtle deep burgundy glow
        innerColor = 'rgba(45, 10, 22, 0.35)';
      } else if (sceneIndex === 3) {
        // Astronomical alignment - celestial midnight blue
        innerColor = 'rgba(10, 18, 35, 0.4)';
      } else if (sceneIndex === 10) {
        // Birthday wish - warm golden candle glow
        innerColor = 'rgba(40, 28, 12, 0.45)';
      }

      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        gradCenterY,
        50,
        width * 0.5,
        gradCenterY,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, innerColor);
      bgGrad.addColorStop(1, outerColor);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += Math.sin(Date.now() * star.flicker) * 0.005;
        const boundedAlpha = Math.max(0.1, Math.min(0.85, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${boundedAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw floating gold embers / particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.pulseAngle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.25;
        const currentAlpha = Math.max(0.05, Math.min(0.95, p.alpha));

        // Wrap around borders
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle glow
        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.8);
        radGrad.addColorStop(0, `${p.color}${currentAlpha})`);
        radGrad.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = radGrad;
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Core bright point
        ctx.fillStyle = `${p.color}${Math.min(1, currentAlpha + 0.3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sceneIndex]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
      <div className="absolute inset-0 vignette-overlay pointer-events-none" />
    </div>
  );
};
