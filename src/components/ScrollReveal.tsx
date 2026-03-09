import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  once?: boolean;
}

const animations = {
  'fade-up': { from: 'translate-y-8 opacity-0', to: 'translate-y-0 opacity-100' },
  'fade-down': { from: '-translate-y-8 opacity-0', to: 'translate-y-0 opacity-100' },
  'fade-left': { from: 'translate-x-8 opacity-0', to: 'translate-x-0 opacity-100' },
  'fade-right': { from: '-translate-x-8 opacity-0', to: 'translate-x-0 opacity-100' },
  'scale': { from: 'scale-90 opacity-0', to: 'scale-100 opacity-100' },
  'fade': { from: 'opacity-0', to: 'opacity-100' },
};

export const ScrollReveal = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  once = true,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal({ once });
  const anim = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all ${isVisible ? anim.to : anim.from} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};
