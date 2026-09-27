import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, FileText, GripVertical, Layers3, Menu, Plus, Settings2, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import SiteUpdates from '@/components/SiteUpdates';
import SiteLinks from '@/components/SiteLinks';
import heroImage from '@/assets/industrial-forms.jpg';

const features = [
  { number: '01', title: 'Build with ease', detail: 'Put together questions, organize sections, and make every form feel like yours.', icon: Layers3 },
  { number: '02', title: 'Make it yours', detail: 'Choose the look, add media, and create a form that fits your project.', icon: Settings2 },
  { number: '03', title: 'Share & collect', detail: 'Publish a link, invite collaborators, and see responses in one place.', icon: Share2 },
];

const Index = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const entry = user ? '/dashboard' : '/auth';
  const entryLabel = user ? 'Open my forms' : 'Start building';

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-inter">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link to="/" className="shrink-0 font-orbitron text-base sm:text-xl uppercase text-primary" aria-label="CrazyForums home">CrazyForums<span className="text-foreground">.</span></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-xs font-semibold uppercase md:flex">
            <a className="transition-colors hover:text-primary" href="#features">Features</a>
            <a className="transition-colors hover:text-primary" href="#about">About</a>
            <a className="transition-colors hover:text-primary" href="#updates">Updates</a>
            <a className="transition-colors hover:text-primary" href="#links">Links</a>
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            {!loading && !user && <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>}
            <Button variant="default" className="rounded-none font-bold uppercase" asChild><Link to={entry}>{entryLabel}<ArrowUpRight className="ml-1" /></Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav aria-label="Mobile navigation" className="flex flex-col border-t border-border bg-background p-5 md:hidden">
          {['features', 'about', 'updates', 'links'].map((id) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-sm font-bold uppercase">{id}</a>)}
          {!user && <Link to="/auth" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold uppercase">Sign in</Link>}
          <Button asChild className="mt-3 rounded-none uppercase"><Link to={entry} onClick={() => setMenuOpen(false)}>{entryLabel}<ArrowUpRight /></Link></Button>
        </nav>}
      </header>

      <main>
        <section className="relative isolate flex min-h-[650px] items-center justify-center overflow-hidden border-b border-border px-5 pb-16 pt-20 text-center sm:px-8 md:min-h-[690px] lg:min-h-[720px]">
          <img src={heroImage} alt="A form-building workspace with blank forms and a laptop" width={1600} height={900} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-background/75" />
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-7 inline-flex items-center gap-3 border-l-2 border-primary pl-3 text-xs font-bold uppercase text-primary">CrazyForums / Form builder</div>
            <h1 className="mx-auto max-w-[1060px] font-orbitron text-[clamp(2.5rem,5.8vw,5.5rem)] uppercase leading-[1.04] text-foreground">Form engineering<br /><span className="text-primary">simplified.</span></h1>
            <p className="mx-auto mb-9 mt-7 max-w-[640px] text-base leading-relaxed text-foreground/80 sm:text-lg">Build a form, make it yours, and share it with the people who matter. From your first question to the final response, keep everything in one place.</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full rounded-none px-8 font-bold uppercase sm:w-auto"><Link to={entry}>{entryLabel}<ArrowRight /></Link></Button>
              <Button variant="outline" size="xl" className="w-full rounded-none border-foreground/50 px-8 font-bold uppercase sm:w-auto" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Explore features<ChevronRight /></Button>
            </div>
          </div>
          <div className="absolute bottom-6 left-5 hidden text-xs font-bold uppercase text-foreground/60 sm:block sm:left-8 lg:left-12">01 / Create with confidence</div>
          <div className="absolute bottom-6 right-5 hidden text-xs font-bold uppercase text-foreground/60 sm:block sm:right-8 lg:right-12">Scroll to explore ↓</div>
        </section>

        <section id="features" className="scroll-mt-20 border-b border-border py-16 sm:py-24">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><p className="mb-4 text-xs font-bold uppercase text-primary">The toolkit / 01</p><h2 className="max-w-[640px] font-orbitron text-3xl uppercase leading-tight sm:text-5xl">Everything to make it happen.</h2></div>
              <p className="max-w-[340px] text-muted-foreground">Create, customize, and publish without slowing down.</p>
            </div>
            <div className="grid gap-px border border-border bg-border md:grid-cols-3">
              {features.map(({ number, title, detail, icon: Icon }) => <div key={number} className="group bg-background p-7 transition-colors hover:bg-card sm:p-9">
                <div className="mb-12 flex items-start justify-between"><Icon className="h-7 w-7 text-primary" strokeWidth={1.5} /><span className="text-xs font-bold text-muted-foreground">/{number}</span></div>
                <h3 className="mb-3 font-orbitron text-lg uppercase">{title}</h3><p className="max-w-[300px] leading-relaxed text-muted-foreground">{detail}</p>
              </div>)}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 border-b border-border bg-card/50 py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div><p className="mb-5 text-xs font-bold uppercase text-primary">Inside the builder / 02</p><h2 className="font-orbitron text-3xl uppercase leading-tight sm:text-5xl">A clearer way to collect ideas.</h2><p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">CrazyForums gives you the space to build forms that fit the moment — a quick question, a detailed application, or anything in between.</p><Button variant="outline" asChild className="mt-8 rounded-none uppercase"><Link to={entry}>Create your form<ArrowUpRight /></Link></Button></div>
            <div className="border border-border bg-background p-3 shadow-2xl shadow-background/50 sm:p-5" aria-label="Example form builder layout">
              <div className="flex h-10 items-center justify-between border-b border-border px-2 text-xs font-bold uppercase text-muted-foreground"><span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Untitled form</span><span className="flex items-center gap-1 text-primary"><Check className="h-4 w-4" /> Draft</span></div>
              <div className="grid min-h-[300px] grid-cols-[60px_1fr] sm:grid-cols-[145px_1fr]">
                <div className="border-r border-border py-5 text-muted-foreground"><p className="mb-6 hidden px-3 text-[10px] font-bold uppercase sm:block">Your fields</p><div className="flex items-center gap-2 border-l-2 border-primary bg-primary/10 px-3 py-3 text-primary"><Layers3 className="h-4 w-4 shrink-0" /><span className="hidden text-xs sm:inline">Section</span></div><div className="flex items-center gap-2 px-3 py-3"><FileText className="h-4 w-4 shrink-0" /><span className="hidden text-xs sm:inline">Short answer</span></div><div className="flex items-center gap-2 px-3 py-3"><Plus className="h-4 w-4 shrink-0" /><span className="hidden text-xs sm:inline">Add field</span></div></div>
                <div className="p-5 sm:p-8"><div className="mb-2 h-1 w-14 bg-primary" /><h3 className="mb-2 font-orbitron text-xl uppercase sm:text-2xl">Your next great idea</h3><p className="mb-7 text-sm text-muted-foreground">Tell us a little about yourself.</p><div className="mb-3 flex items-center gap-3 border border-primary bg-primary/5 p-4 text-sm"><GripVertical className="h-4 w-4 text-primary" /><span>Your name</span><span className="ml-auto text-primary">*</span></div><div className="border border-border p-4 text-sm text-muted-foreground">Email address</div><div className="mt-6 flex justify-end"><span className="bg-primary px-5 py-2 text-xs font-bold uppercase text-primary-foreground">Next step →</span></div></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><SiteUpdates /><SiteLinks /></div>

        <section id="contact" className="border-t border-border py-20 text-center sm:py-28"><div className="mx-auto max-w-[900px] px-5"><p className="mb-5 text-xs font-bold uppercase text-primary">Start here / 03</p><h2 className="font-orbitron text-3xl uppercase sm:text-5xl">Ready to build?</h2><p className="mx-auto my-6 max-w-lg text-lg text-muted-foreground">Your next form starts with a single question.</p><Button asChild size="xl" className="rounded-none px-10 font-bold uppercase"><Link to={entry}>Create a form<ArrowUpRight /></Link></Button></div></section>
      </main>
      <footer className="border-t border-border py-8"><div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><Link to="/" className="font-orbitron text-sm uppercase text-primary">CrazyForums.</Link><p className="text-sm text-muted-foreground">Build forms your way.</p><div className="flex gap-5 text-sm text-muted-foreground"><a href="#features" className="hover:text-primary">Features</a><a href="#about" className="hover:text-primary">About</a><a href="#contact" className="hover:text-primary">Get started</a></div></div></footer>
    </div>
  );
};

export default Index;
