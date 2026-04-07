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
    if (!isVideo && !isImage) { toast.error('Only images and videos are supported'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('File too large (max 50MB)'); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `bg/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('form-images').upload(path, file);
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
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
      <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">Form Design</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Form Title</Label>
          <Input value={title} onChange={(e) => onTitleChange(e.target.value)} className="bg-background/50 border-border/50" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Description</Label>
          <Textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Describe your form..." className="bg-background/50 border-border/50 min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Background Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={settings.backgroundColor} onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
            <Input value={settings.backgroundColor} onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })} className="bg-background/50 border-border/50" />
          </div>
        </div>

        {/* Background Media */}
        <div className="space-y-2">
          <Label className="text-foreground">Background Media</Label>
          {settings.backgroundMedia ? (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden border border-border/50 bg-background/30">
                {settings.backgroundMedia.type === 'image' && (
                  <img src={settings.backgroundMedia.url} alt="Background" className="w-full h-24 object-cover" />
                )}
                {settings.backgroundMedia.type === 'video' && (
                  <video src={settings.backgroundMedia.url} className="w-full h-24 object-cover" muted />
                )}
                {settings.backgroundMedia.type === 'youtube' && (
                  <div className="w-full h-24 flex items-center justify-center bg-background/50">
                    <Video className="w-6 h-6 text-primary" />
                    <span className="text-xs text-muted-foreground ml-2">YouTube Video</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-background/80" onClick={removeBgMedia}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {bgMediaMode === 'none' && (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setBgMediaMode('url')}>
                    <Video className="w-3 h-3" />
                    URL / YouTube
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-3 h-3" />
                    Upload File
                  </Button>
                </div>
              )}
              {bgMediaMode === 'url' && (
                <div className="space-y-2">
                  <Input placeholder="YouTube URL or image/video URL" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} className="bg-background/50 border-border/50 text-sm" />
                  <div className="flex gap-2">
                    <Button type="button" variant="glow" size="sm" className="flex-1" onClick={handleBgUrlSubmit} disabled={!bgUrl.trim()}>Apply</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => { setBgMediaMode('none'); setBgUrl(''); }}>Cancel</Button>
                  </div>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleBgFileUpload} className="hidden" />
              {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
              <p className="text-xs text-muted-foreground">Add a background image, video, or YouTube video</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Gradient Direction</Label>
          <Select value={settings.gradientDirection || 'none'} onValueChange={(value) => onUpdate({ ...settings, gradientDirection: value })}>
            <SelectTrigger className="bg-background/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {gradientDirections.map((dir) => (
                <SelectItem key={dir.value} value={dir.value}>{dir.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">RGB color transition from background to end color</p>
        </div>

        {settings.gradientDirection && settings.gradientDirection !== 'none' && (
          <div className="space-y-2">
            <Label className="text-foreground">Gradient End Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={settings.gradientEndColor || '#4a1d96'} onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
              <Input value={settings.gradientEndColor || '#4a1d96'} onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })} className="bg-background/50 border-border/50" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-foreground">Primary Color</Label>
          <div className="flex gap-2">
            <Input type="color" value={settings.primaryColor} onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
            <Input value={settings.primaryColor} onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })} className="bg-background/50 border-border/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Font Family</Label>
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
          <Label className="text-foreground">Form Logo</Label>
          {settings.logoUrl ? (
            <div className="relative">
              <img src={settings.logoUrl} alt="Form logo" className="w-full h-24 object-contain rounded-lg border border-border/50 bg-background/30" />
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 bg-background/80" onClick={() => onUpdate({ ...settings, logoUrl: undefined })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input placeholder="Enter logo URL" className="bg-background/50 border-border/50" onChange={(e) => { if (e.target.value) onUpdate({ ...settings, logoUrl: e.target.value }); }} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>Paste a URL to your logo image</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Submit Button Text</Label>
          <Input value={settings.submitButtonText || ''} onChange={(e) => onUpdate({ ...settings, submitButtonText: e.target.value })} placeholder="Submit" className="bg-background/50 border-border/50" />
          <p className="text-xs text-muted-foreground">Customize the submit button text (e.g., "שלח" for Hebrew)</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Success Message</Label>
          <Textarea value={settings.successMessage || ''} onChange={(e) => onUpdate({ ...settings, successMessage: e.target.value })} placeholder="Thank you! Your form has been submitted successfully." className="bg-background/50 border-border/50 min-h-[80px]" />
          <p className="text-xs text-muted-foreground">Message shown after form submission</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Closed Form Message</Label>
          <Textarea value={settings.closedFormMessage || ''} onChange={(e) => onUpdate({ ...settings, closedFormMessage: e.target.value })} placeholder="This form is currently closed." className="bg-background/50 border-border/50 min-h-[80px]" />
          <p className="text-xs text-muted-foreground">Message shown when the form is unpublished</p>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;
