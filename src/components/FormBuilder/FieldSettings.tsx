import { useLanguage } from '@/i18n/Language';
import { useLanguage } from '@/i18n/Language';
import { FormField } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FieldSettingsProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
}

const FieldSettings = ({ field, onUpdate }: FieldSettingsProps) => {
  const { t, language } = useLanguage();
  const { t, language } = useLanguage();
  const [newOption, setNewOption] = useState('');
  const [localLabel, setLocalLabel] = useState(field.label);
  const [localPlaceholder, setLocalPlaceholder] = useState(field.placeholder || '');
  const [localOptions, setLocalOptions] = useState<string[]>([]);

  // Sync local state when field changes (e.g., selecting a different field)
  useEffect(() => {
    setLocalLabel(field.label);
    setLocalPlaceholder(field.placeholder || '');
    setLocalOptions(Array.isArray(field.options) ? field.options.map(String) : []);
  }, [field.id, field.label, field.placeholder, field.options]);

  const handleLabelBlur = () => {
    if (localLabel !== field.label) {
      onUpdate({ ...field, label: localLabel });
    }
  };

  const handlePlaceholderBlur = () => {
    if (localPlaceholder !== (field.placeholder || '')) {
      onUpdate({ ...field, placeholder: localPlaceholder });
    }
  };

  const handleOptionBlur = (index: number) => {
    const currentOptions = Array.isArray(field.options) ? field.options.map(String) : [];
    if (localOptions[index] !== currentOptions[index]) {
      onUpdate({ ...field, options: localOptions });
    }
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    const updatedOptions = [...localOptions, newOption.trim()];
    setLocalOptions(updatedOptions);
    onUpdate({ ...field, options: updatedOptions });
    setNewOption('');
  };

  const removeOption = (index: number) => {
    const updatedOptions = localOptions.filter((_, i) => i !== index);
    setLocalOptions(updatedOptions);
    onUpdate({ ...field, options: updatedOptions });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...localOptions];
    updatedOptions[index] = value;
    setLocalOptions(updatedOptions);
  };

  return (
    <div className="glass rounded-xl p-4 h-fit sticky top-24">
      <h3 className="text-lg font-orbitron font-semibold text-foreground mb-4">{t("Field Settings")}</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">{t("Label")}</Label>
          <Input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={handleLabelBlur}
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">{t("Placeholder")}</Label>
          <Input
            value={localPlaceholder}
            onChange={(e) => setLocalPlaceholder(e.target.value)}
            onBlur={handlePlaceholderBlur}
            className="bg-background/50 border-border/50"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-foreground">{t("Required")}</Label>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
          />
        </div>

        {(field.type === t("dropdown") || field.type === t("radio") || field.type === t("multiplechoice")) && (
          <div className=t("space-y-2")>
            <Label className=t{t("(\"text-foreground\")>")}{t("Options")}</Label>
            <div className=t{t("(\"space-y-2\")>")}{localOptions.map((option, index) => (
                <div key={index} className=t("flex items-center gap-2")>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    onBlur={() => handleOptionBlur(index)}
                    className=t("bg-background/50 border-border/50")
                  />
                  <Button
                    variant=t("ghost")
                    size=t("icon")
                    onClick={(){t("=> removeOption(index)} >")}<X className=t{t("(\"w-4 h-4\") />")}</Button>
                </div>
              ))}
            </div>
            <div className=t("flex gap-2")>
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder={t("New option")}n")
                className=t("bg-background/50 border-border/50")
                onKeyDown={(e) => e.key === t("Enter") && addOption()}
              />
              <Button variant=t("glow") size=t("icon") onClick={addOption}>
                <Plus className=t("w-4 h-4") />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldSettings;
