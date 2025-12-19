import { FormField } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface FieldSettingsProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

const FieldSettings = ({ field, onUpdate }: FieldSettingsProps) => {
  const [newOption, setNewOption] = useState('');

  const getOptions = (): string[] => {
    return Array.isArray(field.options) ? field.options.map(String) : [];
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    const options = getOptions();
    onUpdate({ ...field, options: [...options, newOption.trim()] });
    setNewOption('');
  };

  const removeOption = (index: number) => {
    const options = getOptions();
    onUpdate({ ...field, options: options.filter((_, i) => i !== index) });
  };

  return (
    <div className="glass rounded-xl p-4 h-fit sticky top-24">
      <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">Field Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Label</Label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Placeholder</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground">Required</Label>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
          />
        </div>

        {(field.type === 'dropdown' || field.type === 'radio') && (
          <div className="space-y-2">
            <Label className="text-foreground">Options</Label>
            <div className="space-y-2">
              {getOptions().map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const options = [...getOptions()];
                      options[index] = e.target.value;
                      onUpdate({ ...field, options });
                    }}
                    className="bg-background/50 border-border/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="New option"
                className="bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === 'Enter' && addOption()}
              />
              <Button variant="glow" size="icon" onClick={addOption}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldSettings;
