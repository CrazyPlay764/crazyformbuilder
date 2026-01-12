import { Users, Target, Zap } from 'lucide-react';
import TiltCard from '@/components/ui/tilt-card';

const About = () => {
  return (
    <section id="about" className="relative py-24 px-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            About FormFlow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make form creation effortless and beautiful for everyone.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Mission */}
          <TiltCard>
            <div className="glass p-8 rounded-2xl text-center group hover:bg-card/60 transition-all duration-300 h-full">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To empower creators with intuitive tools that transform ideas into stunning, functional forms in minutes.
              </p>
            </div>
          </TiltCard>

          {/* Team */}
          <TiltCard>
            <div className="glass p-8 rounded-2xl text-center group hover:bg-card/60 transition-all duration-300 h-full">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Our Team</h3>
              <p className="text-muted-foreground">
                A passionate team of designers and developers dedicated to crafting the best form-building experience.
              </p>
            </div>
          </TiltCard>

          {/* Vision */}
          <TiltCard>
            <div className="glass p-8 rounded-2xl text-center group hover:bg-card/60 transition-all duration-300 h-full">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To become the go-to platform for anyone who needs beautiful, powerful forms without complexity.
              </p>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};

export default About;
