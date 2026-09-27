import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import About from '@/components/About';
import SiteUpdates from '@/components/SiteUpdates';
import SiteLinks from '@/components/SiteLinks';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
        <SiteUpdates />
        <SiteLinks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
