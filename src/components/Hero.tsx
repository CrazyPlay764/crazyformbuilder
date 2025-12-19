import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      
      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 border border-primary/20 rounded-2xl rotate-12 animate-float opacity-30" />
      <div className="absolute bottom-40 right-20 w-16 h-16 border border-silver/20 rounded-full animate-float-delayed opacity-20" />
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-primary/10 rounded-lg rotate-45 animate-float opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-sm font-inter text-muted-foreground mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Introducing DETA AI Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold leading-tight mb-6 animate-fade-up-delayed">
            <span className="text-foreground">The Future of</span>
            <br />
            <span className="gradient-text glow-text">Intelligent AI</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-inter font-light animate-fade-up-delayed-2">
            Harness the power of next-generation artificial intelligence. 
            Build, deploy, and scale AI solutions with unprecedented speed and precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delayed-2">
            <Button variant="glow" size="xl" className="w-full sm:w-auto">
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glow-outline" size="xl" className="w-full sm:w-auto">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-fade-up-delayed-2">
            {[
              { value: '10M+', label: 'API Requests/Day' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<50ms', label: 'Response Time' },
              { value: '150+', label: 'Countries' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-orbitron font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-inter">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
