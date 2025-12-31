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
    logoUrl?: string;
    gradientDirection?: string;
    gradientEndColor?: string;
  };
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDeleteField: (id: string) => void;
  onSelectField: (field: FormField) => void;
  selectedFieldId: string | null;
  onReorderFields: (dragIndex: number, dropIndex: number) => void;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const getGradientStyle = (direction: string, startColor: string, endColor: string): string => {
  const directionMap: Record<string, string> = {
    'to-b': 'to bottom',
    'to-t': 'to top',
    'to-r': 'to right',
    'to-l': 'to left',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  };
  
  const cssDirection = directionMap[direction] || 'to bottom';
  return `linear-gradient(${cssDirection}, ${startColor}, ${endColor})`;
};

const FormCanvas = ({
  fields,
  formSettings,
  onDrop,
  onDragOver,
  onDeleteField,
  onSelectField,
  selectedFieldId,
  onReorderFields,
  previewDevice = 'desktop',
}: FormCanvasProps) => {
  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]',
  };

  const hasGradient = formSettings.gradientDirection && formSettings.gradientDirection !== 'none';
  const backgroundStyle = hasGradient
    ? { background: getGradientStyle(formSettings.gradientDirection!, formSettings.backgroundColor, formSettings.gradientEndColor || '#4a1d96') }
    : { backgroundColor: formSettings.backgroundColor };
  const handleFieldDragStart = (e: React.DragEvent, index: number, isGripHandle: boolean) => {
    // Only allow dragging from the grip handle, not touch events on mobile
    if (!isGripHandle) {
      e.preventDefault();
      return;
    }
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
      case 'multiplechoice':
        return (
          <div className="space-y-2">
            {(Array.isArray(field.options) ? field.options : ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox disabled />
                <span className="text-sm text-foreground">{String(opt)}</span>
              </div>
            ))}
          </div>
        );
      case 'section':
        return null;
      default:
        return <Input className={baseInputClass} disabled />;
    }
  };

  return (
    <div className="flex-1 flex justify-center">
      <div
        className={`${deviceWidths[previewDevice]} rounded-xl p-6 min-h-[600px] transition-all duration-300`}
        style={{ 
          ...backgroundStyle,
          fontFamily: formSettings.fontFamily
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
      {formSettings.logoUrl && (
        <div className="mb-6 flex justify-center">
          <img 
            src={formSettings.logoUrl} 
            alt="Form logo" 
            className="max-h-20 object-contain"
          />
        </div>
      )}
      {fields.length === 0 ? (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg min-h-[400px]">
          <p className="text-muted-foreground font-inter">Drag and drop fields here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable={false}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleFieldDrop(e, index)}
              onClick={() => onSelectField(field)}
              className={`${
                field.type === 'section' 
                  ? 'py-2' 
                  : 'p-4 rounded-lg border bg-background/20'
              } transition-all duration-200 cursor-pointer ${
                selectedFieldId === field.id
                  ? field.type === 'section' ? 'bg-primary/10' : 'border-primary bg-primary/5'
                  : field.type === 'section' ? '' : 'border-border/30 hover:border-border/50'
              }`}
            >
              {field.type === 'section' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      draggable
                      onDragStart={(e) => handleFieldDragStart(e, index, true)}
                      className="cursor-grab touch-none"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 border-b-2 border-primary/50 pb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {field.label}
                      </h3>
                      {field.placeholder && (
                        <p className="text-sm text-muted-foreground mt-1">{field.placeholder}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
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
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        draggable
                        onDragStart={(e) => handleFieldDragStart(e, index, true)}
                        className="cursor-grab touch-none"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default FormCanvas;
