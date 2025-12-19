import { Brain, Zap, Shield, Globe, Cpu, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Advanced Neural Networks',
    description: 'State-of-the-art deep learning models trained on billions of parameters for unmatched accuracy.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized inference engines delivering sub-50ms response times at massive scale.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 Type II certified with end-to-end encryption and comprehensive audit logging.',
  },
  {
    icon: Globe,
    title: 'Global Infrastructure',
    description: 'Distributed across 50+ data centers worldwide for low-latency access everywhere.',
  },
  {
    icon: Cpu,
    title: 'Custom Model Training',
    description: 'Fine-tune models on your proprietary data with our intuitive training platform.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards and insights to monitor and optimize your AI operations.',
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-sm font-inter text-muted-foreground mb-6">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-orbitron font-bold mb-6">
            <span className="text-foreground">Built for </span>
            <span className="gradient-text">Excellence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter font-light">
            Everything you need to build, deploy, and scale intelligent AI applications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative glass glow-border rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] hover:bg-card/80"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-orbitron font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-inter font-light leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl" style={{
                  background: 'radial-gradient(ellipse at center, hsl(263 70% 50% / 0.1) 0%, transparent 70%)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
