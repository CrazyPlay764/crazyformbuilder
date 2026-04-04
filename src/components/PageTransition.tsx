import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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
      }, 600);

      const timer2 = setTimeout(() => {
        setShowContent(true);
      }, 800);

      const timer3 = setTimeout(() => {
        setIsTransitioning(false);
      }, 1400);

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

  return (
    <>
      {/* Loading Bar */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-[9999] h-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Splash Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
              </motion.div>
              <motion.h1
                className="text-4xl sm:text-5xl font-orbitron font-bold gradient-text glow-text"
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.1em', opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                CrazyForums
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <motion.div
        animate={{
          opacity: showContent ? 1 : 0,
          y: showContent ? 0 : 20,
          filter: showContent ? 'blur(0px)' : 'blur(10px)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {displayChildren}
      </motion.div>
    </>
  );
};

export default PageTransition;
