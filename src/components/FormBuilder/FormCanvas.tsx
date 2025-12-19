import { FormField } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical, Settings } from 'lucide-react';

interface FormCanvasProps {
  fields: FormField[];
  formSettings: {
    backgroundColor: string;
    fontFamily: string;
    primaryColor: string;
  };
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDeleteField: (id: string) => void;
  onSelectField: (field: FormField) => void;
  selectedFieldId: string | null;
  onReorderFields: (dragIndex: number, dropIndex: number) => void;
}

const FormCanvas = ({
  fields,
  formSettings,
  onDrop,
  onDragOver,
  onDeleteField,
  onSelectField,
  selectedFieldId,
  onReorderFields,
}: FormCanvasProps) => {
  const handleFieldDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('fieldIndex', index.toString());
  };

  const handleFieldDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData('fieldIndex');
    if (dragIndex) {
      onReorderFields(parseInt(dragIndex), dropIndex);
    }
  };

  const renderField = (field: FormField) => {
    const baseInputClass = "bg-background/30 border-border/50 focus:border-primary";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseInputClass}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseInputClass}
            disabled
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox disabled />
            <span className="text-sm text-foreground">{field.placeholder || 'Check this option'}</span>
          </div>
        );
      case 'date':
        return (
          <Input type="date" className={baseInputClass} disabled />
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm">Drop files here or click to upload</p>
          </div>
        );
      case 'dropdown':
        return (
          <select className={`w-full p-2 rounded-md ${baseInputClass}`} disabled>
            <option>Select an option</option>
            {(Array.isArray(field.options) ? field.options : []).map((opt, i) => (
              <option key={i}>{String(opt)}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {(Array.isArray(field.options) ? field.options : ['Option 1', 'Option 2']).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} disabled />
                <span className="text-sm text-foreground">{String(opt)}</span>
              </div>
            ))}
          </div>
        );
      default:
        return <Input className={baseInputClass} disabled />;
    }
  };

  return (
    <div
      className="flex-1 rounded-xl p-6 min-h-[600px] transition-all duration-300"
      style={{ 
        backgroundColor: formSettings.backgroundColor,
        fontFamily: formSettings.fontFamily
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {fields.length === 0 ? (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg">
          <p className="text-muted-foreground font-inter">Drag and drop fields here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleFieldDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFieldDrop(e, index)}
              onClick={() => onSelectField(field)}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedFieldId === field.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/30 bg-background/20 hover:border-border/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectField(field);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteField(field.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
