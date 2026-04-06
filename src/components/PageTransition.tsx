import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const NUM_PARTICLES = 20;

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setIsTransitioning(true);
      setShowContent(false);

      const timer1 = setTimeout(() => {
        setDisplayChildren(children);
      }, 700);

      const timer2 = setTimeout(() => {
        setShowContent(true);
      }, 900);

      const timer3 = setTimeout(() => {
        setIsTransitioning(false);
      }, 1600);

      setPrevPath(location.pathname);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  const particles = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1,
  }));

  return (
    <>
      {/* Multi-layer Loading Bar */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[9999] h-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {/* Glow backdrop */}
            <motion.div
              className="absolute top-0 h-8 bg-gradient-to-b from-primary/20 to-transparent"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Main bar */}
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              style={{
                boxShadow: '0 0 20px hsl(var(--primary) / 0.8), 0 0 60px hsl(var(--primary) / 0.4)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Shimmer overlay */}
            <motion.div
              className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
              initial={{ left: '-10%' }}
              animate={{ left: '110%' }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Splash Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15), hsl(var(--background)) 70%)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />

            {/* Floating particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full bg-primary/30"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -80],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Center content */}
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Pulsing ring behind icon */}
              <div className="relative">
                <motion.div
                  className="absolute inset-[-20px] rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-[-10px] rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                >
                  <Sparkles className="w-14 h-14 text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
                </motion.div>
              </div>

              {/* Title with stagger */}
              <motion.h1
                className="text-4xl sm:text-5xl font-orbitron font-bold gradient-text"
                style={{
                  textShadow: '0 0 40px hsl(var(--primary) / 0.4), 0 0 80px hsl(var(--primary) / 0.2)',
                }}
                initial={{ letterSpacing: '0.8em', opacity: 0 }}
                animate={{ letterSpacing: '0.15em', opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                CrazyForums
              </motion.h1>

              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <motion.div
        animate={{
          opacity: showContent ? 1 : 0,
          y: showContent ? 0 : 20,
          filter: showContent ? 'blur(0px)' : 'blur(12px)',
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {displayChildren}
      </motion.div>
    </>
  );
};

export default PageTransition;
