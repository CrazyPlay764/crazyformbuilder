import { useState } from 'react';
import { 
  Type, 
  Mail, 
  Hash, 
  AlignLeft, 
  CheckSquare, 
  Calendar, 
  Upload, 
  ChevronDown, 
  Circle,
  ListChecks,
  LayoutList,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FieldType {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const fieldTypes: FieldType[] = [
  { type: 'section', label: 'Section', icon: <LayoutList className="w-5 h-5" /> },
  { type: 'text', label: 'Text Input', icon: <Type className="w-5 h-5" /> },
  { type: 'email', label: 'Email', icon: <Mail className="w-5 h-5" /> },
  { type: 'number', label: 'Number', icon: <Hash className="w-5 h-5" /> },
  { type: 'textarea', label: 'Text Area', icon: <AlignLeft className="w-5 h-5" /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="w-5 h-5" /> },
  { type: 'multiplechoice', label: 'Multiple Choice', icon: <ListChecks className="w-5 h-5" /> },
  { type: 'date', label: 'Date Picker', icon: <Calendar className="w-5 h-5" /> },
  { type: 'file', label: 'File Upload', icon: <Upload className="w-5 h-5" /> },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown className="w-5 h-5" /> },
  { type: 'radio', label: 'Radio Buttons', icon: <Circle className="w-5 h-5" /> },
];

interface FieldPaletteProps {
  onDragStart: (type: string, label: string) => void;
  onAddField?: (type: string, label: string) => void;
}

const FieldPalette = ({ onDragStart, onAddField }: FieldPaletteProps) => {
  const [selectedField, setSelectedField] = useState<FieldType | null>(null);

  const handleFieldClick = (field: FieldType) => {
    setSelectedField(selectedField?.type === field.type ? null : field);
  };

  const handleAddClick = () => {
    if (selectedField && onAddField) {
      onAddField(selectedField.type, selectedField.label);
      setSelectedField(null);
    }
  };

  return (
    <div className="glass rounded-xl p-4 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-orbitron font-semibold text-foreground">Fields</h3>
        <Button
          size="sm"
          onClick={handleAddClick}
          disabled={!selectedField}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <div
            key={field.type}
            draggable
            onDragStart={() => onDragStart(field.type, field.label)}
            onClick={() => handleFieldClick(field)}
            className={`flex items-center gap-3 p-3 rounded-lg bg-background/50 border cursor-pointer transition-all duration-200 ${
              selectedField?.type === field.type
                ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <span className="text-primary">{field.icon}</span>
            <span className="text-sm font-inter text-foreground">{field.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldPalette;
