import { MousePointer2, Palette, Type, Calendar, Upload, Users } from 'lucide-react';

const features = [
  {
    icon: MousePointer2,
    title: 'Drag & Drop Builder',
    description: 'Intuitive drag and drop interface to create forms in minutes without any coding.',
  },
  {
    icon: Palette,
    title: 'Custom Design',
    description: 'Change colors, fonts, and styles to match your brand with our design customization tools.',
  },
  {
    icon: Type,
    title: 'Advanced Field Types',
    description: 'Text, email, number, textarea, checkboxes, date pickers, file uploads, dropdowns, and more.',
  },
  {
    icon: Calendar,
    title: 'Date & File Fields',
    description: 'Built-in date pickers and file upload fields for collecting any type of data.',
  },
  {
    icon: Upload,
    title: 'Save & Export',
    description: 'Save your forms to the cloud and access them from anywhere, anytime.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members to edit forms together with role-based permissions.',
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
            <span className="text-foreground">Powerful </span>
            <span className="gradient-text">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter font-light">
            Everything you need to create, customize, and manage beautiful forms.
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
