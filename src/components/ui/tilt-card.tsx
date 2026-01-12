import { useRef, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltIntensity?: number;
  glareEnabled?: boolean;
}

const TiltCard = ({ 
  children, 
  className, 
  tiltIntensity = 15,
  glareEnabled = true 
}: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Spring animation on mouse leave
  useEffect(() => {
    if (!isHovering && (rotateX !== 0 || rotateY !== 0)) {
      setIsAnimating(true);
      
      // Wobble animation sequence
      const wobble = [
        { x: rotateX * -0.3, y: rotateY * -0.3, scale: 1.01, sx: shadowOffset.x * -0.3, sy: shadowOffset.y * -0.3 },
        { x: rotateX * 0.15, y: rotateY * 0.15, scale: 0.99, sx: shadowOffset.x * 0.15, sy: shadowOffset.y * 0.15 },
        { x: rotateX * -0.05, y: rotateY * -0.05, scale: 1.005, sx: shadowOffset.x * -0.05, sy: shadowOffset.y * -0.05 },
        { x: 0, y: 0, scale: 1, sx: 0, sy: 0 },
      ];
      
      let step = 0;
      const animate = () => {
        if (step < wobble.length) {
          setRotateX(wobble[step].x);
          setRotateY(wobble[step].y);
          setScale(wobble[step].scale);
          setShadowOffset({ x: wobble[step].sx, y: wobble[step].sy });
          step++;
          setTimeout(animate, 100);
        } else {
          setIsAnimating(false);
        }
      };
      
      animate();
    }
  }, [isHovering]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isAnimating) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    setRotateX(mouseY * tiltIntensity);
    setRotateY(-mouseX * tiltIntensity);
    setScale(1.02);
    
    // Shadow moves opposite to tilt direction
    setShadowOffset({
      x: mouseX * 20,
      y: mouseY * 20
    });
    
    setGlarePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setGlarePosition({ x: 50, y: 50 });
  };

  const transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  
  // Dynamic shadow that moves opposite to tilt
  const dynamicShadow = isHovering 
    ? `${shadowOffset.x}px ${shadowOffset.y}px 30px -5px hsl(var(--primary) / 0.25), ${shadowOffset.x * 0.5}px ${shadowOffset.y * 0.5}px 60px -10px hsl(var(--primary) / 0.15)`
    : '0 0 0 0 transparent';

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative',
        isAnimating ? 'transition-none' : 'transition-all duration-200 ease-out',
        className
      )}
      style={{ 
        transform,
        transformStyle: 'preserve-3d',
        boxShadow: dynamicShadow,
        borderRadius: '1rem'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Glare effect */}
      {glareEnabled && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden transition-opacity duration-300"
          style={{ opacity: isHovering ? 1 : 0 }}
        >
          <div
            className="absolute w-full h-full"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, hsl(var(--primary) / 0.15) 0%, transparent 50%)`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TiltCard;
