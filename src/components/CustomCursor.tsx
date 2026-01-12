import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        !!target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isClickable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>
      
      {/* Outer ring - follows with slight delay */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-150 ease-out"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : isPointer ? 1.5 : 1})`,
        }}
      >
        <div 
          className={`
            w-8 h-8 rounded-full border-2 
            transition-all duration-200
            ${isPointer 
              ? 'border-primary bg-primary/10' 
              : 'border-primary/60 bg-transparent'
            }
          `}
          style={{
            boxShadow: isPointer 
              ? '0 0 20px hsl(var(--primary) / 0.4), inset 0 0 10px hsl(var(--primary) / 0.1)' 
              : '0 0 10px hsl(var(--primary) / 0.2)'
          }}
        />
      </div>
      
      {/* Inner dot - precise position */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 1.5 : 1})`,
        }}
      >
        <div 
          className={`
            w-2 h-2 rounded-full bg-primary
            transition-all duration-100
            ${isPointer ? 'opacity-0' : 'opacity-100'}
          `}
          style={{
            boxShadow: '0 0 8px hsl(var(--primary)), 0 0 16px hsl(var(--primary) / 0.5)'
          }}
        />
      </div>

      {/* Trailing particles effect on pointer */}
      {isPointer && (
        <div
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40 animate-ping"
              style={{
                animationDelay: `${i * 100}ms`,
                animationDuration: '1s',
                left: `${Math.cos((i * Math.PI) / 2) * 12}px`,
                top: `${Math.sin((i * Math.PI) / 2) * 12}px`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CustomCursor;
