import { useState, useEffect } from 'react';
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
    submitButtonText?: string;
    successMessage?: string;
    closedFormMessage?: string;
    gradientDirection?: string;
    gradientEndColor?: string;
  };
  onUpdate: (settings: FormSettingsProps['settings']) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  isOpen: boolean;
  onClose: () => void;
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

const FormSettings = ({ settings, onUpdate, title, onTitleChange, description, onDescriptionChange, isOpen, onClose }: FormSettingsProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Centered Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className={`w-[500px] max-w-[90vw] max-h-[85vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl pointer-events-auto transition-all duration-300 ease-out ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-orbitron font-semibold text-foreground">Form Design</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
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
                  <Label className="text-foreground">Gradient Direction</Label>
                  <Select
                    value={settings.gradientDirection || 'none'}
                    onValueChange={(value) => onUpdate({ ...settings, gradientDirection: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientDirections.map((dir) => (
                        <SelectItem key={dir.value} value={dir.value}>
                          {dir.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">RGB color transition from background to end color</p>
                </div>

                {settings.gradientDirection && settings.gradientDirection !== 'none' && (
                  <div className="space-y-2">
                    <Label className="text-foreground">Gradient End Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.gradientEndColor || '#4a1d96'}
                        onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.gradientEndColor || '#4a1d96'}
                        onChange={(e) => onUpdate({ ...settings, gradientEndColor: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                )}

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

                <div className="space-y-2">
                  <Label className="text-foreground">Submit Button Text</Label>
                  <Input
                    value={settings.submitButtonText || ''}
                    onChange={(e) => onUpdate({ ...settings, submitButtonText: e.target.value })}
                    placeholder="Submit"
                    className="bg-background/50 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">Customize the submit button text (e.g., "שלח" for Hebrew)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Success Message</Label>
                  <Textarea
                    value={settings.successMessage || ''}
                    onChange={(e) => onUpdate({ ...settings, successMessage: e.target.value })}
                    placeholder="Thank you! Your form has been submitted successfully."
                    className="bg-background/50 border-border/50 min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">Message shown after form submission</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Closed Form Message</Label>
                  <Textarea
                    value={settings.closedFormMessage || ''}
                    onChange={(e) => onUpdate({ ...settings, closedFormMessage: e.target.value })}
                    placeholder="This form is currently closed."
                    className="bg-background/50 border-border/50 min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">Message shown when the form is unpublished</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormSettings;
