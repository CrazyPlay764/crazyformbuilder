import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTA = () => {
  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass glow-border rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-inter text-primary mb-8">
                <Sparkles className="w-4 h-4" />
                Join the conversation today
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-orbitron font-bold mb-6">
                <span className="text-foreground">Ready to Join</span>
                <br />
                <span className="gradient-text glow-text">The Community?</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-inter font-light">
                Join millions of members already connecting on CrazyForums to share ideas and build lasting relationships.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="glow" size="xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="glass" size="xl">
                  Talk to Sales
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-8 font-inter">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
