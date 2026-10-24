import { useLanguage } from '@/i18n/Language';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Megaphone, Plus, Trash2, Pencil, X, Check, Image, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ScrollReveal } from './ScrollReveal';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface SiteUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string;
  media: MediaItem[];
}

const ADMIN_EMAIL = 'danieletigon@gmail.com';

const SiteUpdates = () => {
  const { t, language } = useLanguage();
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from('site_updates')
      .select('id, title, content, created_at, media')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setUpdates(data.map(u => ({
        ...u,
        media: (u.media as unknown as MediaItem[]) || []
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        toast.error(t("רק תמונות וסרטונים מותרים"));
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(t("הקובץ גדול מדי (מקסימום 50MB)"));
        continue;
      }

      const ext = file.name.split('.').pop();
      const path = `updates/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('form-images').upload(path, file);
      if (error) {
        toast.error(t("שגיאה בהעלאת הקובץ"));
        continue;
      }
      const { data: urlData } = supabase.storage.from('form-images').getPublicUrl(path);
      setMedia(prev => [...prev, { type: isVideo ? 'video' : 'image', url: urlData.publicUrl }]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user) return;

    const mediaJson = JSON.parse(JSON.stringify(media));

    if (editingId) {
      const { error } = await supabase.from('site_updates').update({ title: title.trim(), content: content.trim(), media: mediaJson }).eq('id', editingId);
      if (error) { toast.error(t("שגיאה בעדכון")); return; }
      toast.success(t("העדכון נערך בהצלחה"));
    } else {
      const { error } = await supabase.from('site_updates').insert([{ title: title.trim(), content: content.trim(), media: mediaJson, user_id: user.id }]);
      if (error) { toast.error(t("שגיאה בפרסום העדכון")); return; }
      toast.success(t("העדכון פורסם בהצלחה"));
    }

    setTitle(''); setContent(''); setMedia([]); setShowForm(false); setEditingId(null);
    fetchUpdates();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('site_updates').delete().eq('id', id);
    if (error) { toast.error(t("שגיאה במחיקה")); return; }
    toast.success(t("העדכון נמחק"));
    fetchUpdates();
  };

  const handleEdit = (update: SiteUpdate) => {
    setEditingId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setMedia(update.media || []);
    setShowForm(true);
  };

  if (loading) return null;
  if (updates.length === 0 && !isAdmin) return null;

  return (
    <section id="updates" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground mb-6">
              <Megaphone className="w-4 h-4 text-primary" />
              <span>{t("עדכוני האתר")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              <span className="gradient-text">{t("מה חדש?")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-inter">{t("העדכונים האחרונים והשיפורים באתר")}</p>
          </div>
        </ScrollReveal>

        {isAdmin && (
          <div className=t("mb-8 flex justify-center")>
            {!showForm ? (
              <Button variant=t("glow")w") onClick={() => setShowForm(true)} className=t("gap-2")2")>
                <Plus className=t("w-4 h-4")4") />{t("פרסם עדכון חדש")}</Button>
            ) : (
              <div className=t("w-full max-w-xl glass-card rounded-xl p-6 space-y-4")4")>
                <div className=t("flex items-center justify-between")n")>
                  <h3 className=t("text-lg font-orbitron font-bold text-foreground")d")>
                    {editingId ? t("ערוך עדכון")ן")ן") : t("עדכון חדש")ש")ש")}
                  </h3>
                  <button onClick={() => { setShowForm(false); setEditingId(null); setTitle(''); setContent(''); setMedia([]); }}>
                    <X className=t("w-5 h-5 text-muted-foreground hover:text-foreground transition-colors")s") />
                  </button>
                </div>
                <Input placeholder={t("כותרת העדכון")}ן")ן") value={title} onChange={(e) => setTitle(e.target.value)} className=t("text-right")t") dir=t("rtl")l") />
                <Textarea placeholder={t("תוכן העדכון...")}.").") value={content} onChange={(e) => setContent(e.target.value)} className=t("text-right min-h-[100px]")]") dir=t("rtl")l") />

                {/* Media preview */}
                {media.length > 0 && (
                  <div className=t("grid grid-cols-2 gap-2")2")2")>
                    {media.map((item, i) => (
                      <div key={i} className=t("relative rounded-lg overflow-hidden border border-border")r")r")>
                        {item.type === t("image")e")e")e") ? (
                          <img src={item.url} alt="" className=t("w-full h-32 object-cover")r")r")r") />
                        ) : (
                          <video src={item.url} className=t("w-full h-32 object-cover")r")r")r") />
                        )}
                        <button onClick={() => removeMedia(i)} className=t("absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-destructive/20 transition-colors")s")s")>
                          <X className=t("w-3 h-3")3")3") />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <div className=t("flex gap-2")2")>
                  <input ref={fileInputRef} type=t("file")e") accept=t("image/*,video/*")*") multiple onChange={handleFileUpload} className=t("hidden")n") />
                  <Button type=t("button")n") variant=t("outline")e") size=t("sm")m") onClick={() => fileInputRef.current?.click()} disabled={uploading} className=t("gap-2")2")>
                    <Upload className=t("w-4 h-4")4") />
                    {uploading ? t("מעלה...").").") : t("הוסף תמונה/סרטון")ן")ן")}
                  </Button>
                </div>

                <Button variant=t("glow")w") onClick={handleSubmit} className=t("w-full gap-2")2") disabled={!title.trim() || !content.trim() || uploading}>
                  <Check className=t("w-4 h-4")4") />
                  {editingId ? t("שמור שינויים")ם")ם") : t("פרסם")ם")ם")}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {updates.map((update, index) => (
            <ScrollReveal key={update.id} delay={index * 0.1}>
              <div className="glass-card rounded-xl p-6 group hover:border-primary/30 transition-all duration-300" dir="rtl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-orbitron font-semibold text-foreground mb-2">
                      {update.title}
                    </h3>
                    <p className="text-muted-foreground font-inter whitespace-pre-wrap">
                      {update.content}
                    </p>

                    {/* Display media */}
                    {update.media && update.media.length > 0 && (
                      <div className=t("mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3")>
                        {update.media.map((item, i) => (
                          <div key={i} className=t("rounded-lg overflow-hidden border border-border")>
                            {item.type === t("image")e") ? (
                              <img src={item.url} alt="" className=t("w-full h-48 object-cover")r") />
                            ) : (
                              <video src={item.url} controls className=t("w-full h-48 object-cover")r") />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="text-xs text-muted-foreground/60 mt-3 block font-inter" dir="ltr">
                      {formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: language === 'he' ? he : undefined })}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className=t("flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity")>
                      <button onClick={() => handleEdit(update)} className=t("p-2 hover:bg-primary/10 rounded-lg transition-colors")>
                        <Pencil className=t("w-4 h-4 text-muted-foreground hover:text-primary") />
                      </button>
                      <button onClick={() => handleDelete(update.id)} className=t("p-2 hover:bg-destructive/10 rounded-lg transition-colors")>
                        <Trash2 className=t("w-4 h-4 text-muted-foreground hover:text-destructive") />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}

          {updates.length === 0 && isAdmin && (
            <p className=t("text-center text-muted-foreground font-inter")>{t("אין עדכונים עדיין. פרסם את העדכון הראשון!")}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SiteUpdates;
