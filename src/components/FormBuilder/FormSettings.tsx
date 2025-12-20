import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, ImageIcon } from 'lucide-react';

interface FormSettingsProps {
  settings: {
    backgroundColor: string;
    fontFamily: string;
    primaryColor: string;
    logoUrl?: string;
  };
  onUpdate: (settings: { backgroundColor: string; fontFamily: string; primaryColor: string; logoUrl?: string }) => void;
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

const FormSettings = ({ settings, onUpdate, title, onTitleChange, description, onDescriptionChange }: FormSettingsProps) => {
  return (
    <div className="glass rounded-xl p-4 h-fit sticky top-24">
      <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">Form Design</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Form Title</Label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe your form..."
            className="bg-background/50 border-border/50 min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              value={settings.backgroundColor}
              onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })}
              className="bg-background/50 border-border/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              value={settings.primaryColor}
              onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })}
              className="bg-background/50 border-border/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Font Family</Label>
          <Select
            value={settings.fontFamily}
            onValueChange={(value) => onUpdate({ ...settings, fontFamily: value })}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
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
              <img 
                src={settings.logoUrl} 
                alt="Form logo" 
                className="w-full h-24 object-contain rounded-lg border border-border/50 bg-background/30"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                onClick={() => onUpdate({ ...settings, logoUrl: undefined })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter logo URL"
                className="bg-background/50 border-border/50"
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdate({ ...settings, logoUrl: e.target.value });
                  }
                }}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>Paste a URL to your logo image</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormSettings;
