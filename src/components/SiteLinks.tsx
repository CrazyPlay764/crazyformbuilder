import { useLanguage } from '@/i18n/Language';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link2, Plus, Trash2, Pencil, X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ScrollReveal } from './ScrollReveal';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  position: number;
}

const ADMIN_EMAIL = 'danieletigon@gmail.com';

const SiteLinks = () => {
  const { t, language } = useLanguage();
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { user } = useAuth();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('site_links')
      .select('id, title, url, position')
      .order('position', { ascending: true });

    if (!error && data) setLinks(data);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setUrl('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim() || !user) return;

    const finalUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;

    if (editingId) {
      const { error } = await supabase.from('site_links').update({ title: title.trim(), url: finalUrl }).eq('id', editingId);
      if (error) { toast.error(t("שגיאה בעדכון")); return; }
      toast.success(t("הקישור עודכן"));
    } else {
      const { error } = await supabase.from('site_links').insert([{ title: title.trim(), url: finalUrl, user_id: user.id, position: links.length }]);
      if (error) { toast.error(t("שגיאה בהוספת הקישור")); return; }
      toast.success(t("הקישור נוסף"));
    }
    resetForm();
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('site_links').delete().eq('id', id);
    if (error) { toast.error(t("שגיאה במחיקה")); return; }
    toast.success(t("הקישור נמחק"));
    fetchLinks();
  };

  const handleEdit = (link: SiteLink) => {
    setEditingId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setShowForm(true);
  };

  if (loading) return null;
  if (links.length === 0 && !isAdmin) return null;

  return (
    <section id="links" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground mb-6">
              <Link2 className="w-4 h-4 text-primary" />
              <span>{t("קישורים")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              <span className="gradient-text">{t("קישורים שימושיים")}</span>
            </h2>
          </div>
        </ScrollReveal>

        {isAdmin && (
          <div className=t("mb-8 flex justify-center")>
            {!showForm ? (
              <Button variant=t("glow")w") onClick={() => setShowForm(true)} className=t("gap-2")2")>
                <Plus className=t("w-4 h-4")4") />{t("הוסף קישור")}</Button>
            ) : (
              <div className=t("w-full max-w-md glass-card rounded-xl p-6 space-y-4")4")>
                <div className=t("flex items-center justify-between")n")>
                  <h3 className=t("text-lg font-orbitron font-bold text-foreground")d")>
                    {editingId ? t("ערוך קישור")ר")ר") : t("קישור חדש")ש")ש")}
                  </h3>
                  <button onClick={resetForm}>
                    <X className=t("w-5 h-5 text-muted-foreground hover:text-foreground transition-colors")s") />
                  </button>
                </div>
                <Input placeholder={t("שם הקישור")}ר")ר") value={title} onChange={(e) => setTitle(e.target.value)} className=t("text-right")t") dir=t("rtl")l") />
                <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} dir=t("ltr")r") />
                <Button variant=t("glow")w") onClick={handleSubmit} className=t("w-full gap-2")2") disabled={!title.trim() || !url.trim()}>
                  <Check className=t("w-4 h-4")4") />
                  {editingId ? t("שמור")ר")ר") : t("הוסף")ף")ף")}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link, index) => (
            <ScrollReveal key={link.id} delay={index * 0.08}>
              <div className="glass-card rounded-xl p-4 group hover:border-primary/30 transition-all duration-300 flex items-center justify-between gap-3" dir="rtl">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                  <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-inter text-foreground truncate group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                </a>
                {isAdmin && (
                  <div className=t("flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0")>
                    <button onClick={() => handleEdit(link)} className=t("p-1.5 hover:bg-primary/10 rounded-lg transition-colors")>
                      <Pencil className=t("w-3.5 h-3.5 text-muted-foreground hover:text-primary") />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className=t("p-1.5 hover:bg-destructive/10 rounded-lg transition-colors")>
                      <Trash2 className=t("w-3.5 h-3.5 text-muted-foreground hover:text-destructive") />
                    </button>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}

          {links.length === 0 && isAdmin && (
            <p className=t("text-center text-muted-foreground font-inter col-span-full")>{t("אין קישורים עדיין. הוסף את הקישור הראשון!")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SiteLinks;
