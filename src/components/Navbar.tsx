import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-strong py-3 shadow-lg shadow-background/50'
            : 'glass py-5'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary group-active:scale-90 group-active:rotate-12" />
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-glow-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-orbitron font-bold gradient-text transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                CrazyForums
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    const element = document.querySelector(link.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 text-sm font-inter relative group cursor-pointer hover:scale-105"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {!loading && user ? (
                <>
                  <Button variant="glow" size="sm" asChild>
                    <Link to="/dashboard">Forms Area</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="glow" size="sm" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Tray */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] glass-strong z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <span className="text-lg font-orbitron font-bold gradient-text">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-foreground hover:text-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {navLinks.map((link, index) => (
              <button
                key={link.name}
                onClick={() => {
                  const element = document.querySelector(link.href);
                  element?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg text-muted-foreground hover:text-foreground hover:translate-x-2 transition-all duration-300 font-inter animate-fade-up text-left cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            {!loading && user ? (
              <Button variant="glow" className="w-full justify-center" asChild>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Forms Area</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-center" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button variant="glow" className="w-full justify-center" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
