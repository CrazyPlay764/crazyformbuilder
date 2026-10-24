import { useLanguage } from '@/i18n/Language';
import { useLanguage } from '@/i18n/Language';
import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, ImageIcon, Upload, Video, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormSettingsProps {
  settings: {
    backgroundColor: string;
    fontFamily: string;
    primaryColor: string;
    logoUrl?: string;
    submitButtonText?: string;
    successMessage?: string;
    closedFormMessage?: string;
    gradientDirection?: string;
    gradientEndColor?: string;
    backgroundMedia?: { type: 'image' | 'video' | 'youtube'; url: string };
  };
  onUpdate: (settings: FormSettingsProps['settings']) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
}

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Orbitron', label: 'Orbitron' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];

const gradientDirections = [
  { value: 'none', label: 'No Gradient' },
  { value: 'to-b', label: 'Down' },
  { value: 'to-t', label: 'Up' },
  { value: 'to-r', label: 'Right' },
  { value: 'to-l', label: 'Left' },
  { value: 'to-br', label: 'Diagonal Down-Right' },
  { value: 'to-bl', label: 'Diagonal Down-Left' },
  { value: 'to-tr', label: 'Diagonal Up-Right' },
  { value: 'to-tl', label: 'Diagonal Up-Left' },
];

const extractYoutubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const FormSettings = ({ settings, onUpdate, title, onTitleChange, description, onDescriptionChange }: FormSettingsProps) => {
  const { t, language } = useLanguage();
  const { t, language } = useLanguage();
  const [bgMediaMode, setBgMediaMode] = useState<'none' | 'url' | 'file' | 'youtube'>(
    settings.backgroundMedia ? (settings.backgroundMedia.type === 'youtube' ? 'youtube' : 'url') : 'none'
  );
  const [bgUrl, setBgUrl] = useState(settings.backgroundMedia?.url || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) { toast.error(t("Only images and videos are supported")); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error(t("File too large (max 50MB)")); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `bg/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('form-images').upload(path, file);
    if (error) { toast.error(t("Upload failed")); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('form-images').getPublicUrl(path);
    onUpdate({ ...settings, backgroundMedia: { type: isVideo ? 'video' : 'image', url: urlData.publicUrl } });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleBgUrlSubmit = () => {
    if (!bgUrl.trim()) return;
    const ytId = extractYoutubeId(bgUrl.trim());
    if (ytId) {
      onUpdate({ ...settings, backgroundMedia: { type: 'youtube', url: bgUrl.trim() } });
    } else {
      const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(bgUrl.trim());
      onUpdate({ ...settings, backgroundMedia: { type: isVideo ? 'video' : 'image', url: bgUrl.trim() } });
    }
  };

  const removeBgMedia = () => {
    onUpdate({ ...settings, backgroundMedia: undefined });
    setBgMediaMode('none');
    setBgUrl('');
  };

  return (
    <div className="glass rounded-xl p-4 h-fit sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">{t("Form Design")}</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">{t("Form Title")}</Label>
          <Input value={title} onChange={(e) => onTitleChange(e.target.value)} className="bg-background/50 border-border/50" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Description")}</Label>
          <Textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder={t("Describe your form...")} className="bg-background/50 border-border/50 min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Background Color")}</Label>
          <div className="flex gap-2">
            <Input type="color" value={settings.backgroundColor} onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
            <Input value={settings.backgroundColor} onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })} className="bg-background/50 border-border/50" />
          </div>
        </div>

        {/* Background Media */}
        <div className="space-y-2">
          <Label className="text-foreground">{t("Background Media")}</Label>
          {settings.backgroundMedia ? (
            <div className=t("space-y-2")>
              <div className=t{t("(\"relative rounded-lg overflow-hidden border border-border/50 bg-background/30\")>")}{settings.backgroundMedia.type === t("image"){t("e\") && (")}<img src={settings.backgroundMedia.url} alt={t("Background")}d{t("\")d\") className=t(\"w-full h-24 object-cover\")r\") /> )}")}{settings.backgroundMedia.type === t("video"){t("o\") && (")}<video src={settings.backgroundMedia.url} className=t{t("(\"w-full h-24 object-cover\")r\") muted /> )}")}{settings.backgroundMedia.type === t("youtube"){t("e\") && (")}<div className=t{t("(\"w-full h-24 flex items-center justify-center bg-background/50\")0\")>")}<Video className=t{t("(\"w-6 h-6 text-primary\")y\") />")}<span className=t{t("(\"text-xs text-muted-foreground ml-2\")2\")>")}{t("YouTube Video")}</span>
                  </div>
                )}
                <Button variant=t{t("(\"ghost\") size=t(\"icon\") className=t(\"absolute top-1 right-1 h-6 w-6 bg-background/80\") onClick=")}{removeBgMedia}>
                  <X className=t{t("(\"w-4 h-4\") />")}</Button>
              </div>
            </div>
          ) : (
            <div className=t("space-y-2")>
              {bgMediaMode === t("none")e") && (
                <div className=t("flex gap-2")2")>
                  <Button type=t("button")n") variant=t("outline")e") size=t("sm")m") className=t("flex-1 gap-1 text-xs")s") onClick={() => setBgMediaMode(t("url")l"))}>
                    <Video className=t("w-3 h-3")3") />{t("URL / YouTube")}</Button>
                  <Button type=t("button")n") variant=t("outline")e") size=t("sm")m") className=t("flex-1 gap-1 text-xs")s") onClick={() => fileRef.current?.click()}>
                    <Upload className=t("w-3 h-3")3") />{t("Upload File")}</Button>
                </div>
              )}
              {bgMediaMode === t("url")l") && (
                <div className=t("space-y-2")2")>
                  <Input placeholder={t("YouTube URL or image/video URL")}L")L") value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} className=t("bg-background/50 border-border/50 text-sm")m") />
                  <div className=t("flex gap-2")2")>
                    <Button type=t("button")n") variant=t("glow")w") size=t("sm")m") className=t("flex-1")1") onClick={handleBgUrlSubmit} disabled={!bgUrl.trim()}>{t("Apply")}</Button>
                    <Button type=t("button")n") variant=t("outline")e") size=t("sm")m") onClick={() => { setBgMediaMode(t("none")e")); setBgUrl(''); }}>{t("Cancel")}</Button>
                  </div>
                </div>
              )}
              <input ref={fileRef} type=t("file") accept=t("image/*,video/*") onChange={handleBgFileUpload} className=t("hidden") />
              {uploading && <p className=t("text-xs text-muted-foreground")d")>{t("Uploading...")}</p>}
              <p className=t("text-xs text-muted-foreground")>{t("Add a background image, video, or YouTube video")}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Gradient Direction")}</Label>
          <Select value={settings.gradientDirection || t("none")} onValueChange={(value) => onUpdate({ ...settings, gradientDirection: value })}>
            <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {gradientDirections.map((dir) => (
                <SelectItem key={dir.value} value={dir.value}>{t(dir.label)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t("RGB color transition from background to end color")}</p>
        </div>

        {settings.gradientDirection && settings.gradientDirection !== t("none") && (
          <div className=t("space-y-2")>
            <Label className=t("text-foreground")>{t("Gradient End Color")}</Label>
            <div className=t("flex gap-2")>
              <Input type=t("color") value={settings.gradientEndColor || t("#4a1d96")6")} onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })} className=t("w-12 h-10 p-1 cursor-pointer") />
              <Input value={settings.gradientEndColor || t("#4a1d96")6")} onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })} className=t("bg-background/50 border-border/50") />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-foreground">{t("Primary Color")}</Label>
          <div className="flex gap-2">
            <Input type="color" value={settings.primaryColor} onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
            <Input value={settings.primaryColor} onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })} className="bg-background/50 border-border/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Font Family")}</Label>
          <Select value={settings.fontFamily} onValueChange={(value) => onUpdate({ ...settings, fontFamily: value })}>
            <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {fonts.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Form Logo")}</Label>
          {settings.logoUrl ? (
            <div className=t("relative")>
              <img src={settings.logoUrl} alt={t("Form logo")}o{t("\") className=t(\"w-full h-24 object-contain rounded-lg border border-border/50 bg-background/30\") />")}<Button variant=t{t("(\"ghost\") size=t(\"icon\") className=t(\"absolute top-1 right-1 h-6 w-6 bg-background/80\") onClick=")}{() => onUpdate({ ...settings, logoUrl: undefined })}>
                <X className=t{t("(\"w-4 h-4\") />")}</Button>
            </div>
          ) : (
            <div className=t("space-y-2")>
              <Input placeholder={t("Enter logo URL")}L") className=t("bg-background/50 border-border/50") onChange={(e) => { if (e.target.value) onUpdate({ ...settings, logoUrl: e.target.value }); }} />
              <div className=t("flex items-center gap-2 text-xs text-muted-foreground")>
                <ImageIcon className=t("w-4 h-4") />
                <span>{t("Paste a URL to your logo image")}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Submit Button Text")}</Label>
          <Input value={settings.submitButtonText || ''} onChange={(e) => onUpdate({ ...settings, submitButtonText: e.target.value })} placeholder={t("Submit")} className="bg-background/50 border-border/50" />
          <p className="text-xs text-muted-foreground">{t("Customize the submit button text (e.g., \"שלח\" for Hebrew)")}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Success Message")}</Label>
          <Textarea value={settings.successMessage || ''} onChange={(e) => onUpdate({ ...settings, successMessage: e.target.value })} placeholder={t("Thank you! Your form has been submitted successfully.")} className="bg-background/50 border-border/50 min-h-[80px]" />
          <p className="text-xs text-muted-foreground">{t("Message shown after form submission")}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Closed Form Message")}</Label>
          <Textarea value={settings.closedFormMessage || ''} onChange={(e) => onUpdate({ ...settings, closedFormMessage: e.target.value })} placeholder={t("This form is currently closed.")} className="bg-background/50 border-border/50 min-h-[80px]" />
          <p className="text-xs text-muted-foreground">{t("Message shown when the form is unpublished")}</p>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;
