import { useRef, useState, ReactNode } from 'react';
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
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (normalized -1 to 1)
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    // Card tilts TOWARD the cursor (like gravity pulling it)
    // If cursor is top-left, card tilts so top-left goes down
    const rotateX = mouseY * tiltIntensity; // Positive mouseY = tilt forward
    const rotateY = -mouseX * tiltIntensity; // Negative mouseX = tilt left
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    
    // Glare follows cursor
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
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={cn('relative transition-transform duration-200 ease-out', className)}
      style={{ 
        transform,
        transformStyle: 'preserve-3d'
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
