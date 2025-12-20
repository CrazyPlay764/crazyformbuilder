import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { FormField, Form } from '@/types/form';

const FormPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, string | boolean | string[]>>({});

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id]);

  const fetchFormData = async () => {
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (formError || !formData) {
      toast.error('Form not found');
      navigate('/');
      return;
    }

    const settings = typeof formData.settings === 'object' && formData.settings !== null
      ? formData.settings as { backgroundColor: string; fontFamily: string; primaryColor: string; logoUrl?: string }
      : { backgroundColor: '#1a1a2e', fontFamily: 'Inter', primaryColor: '#8b5cf6' };

    setForm({ ...formData, settings, is_published: formData.is_published ?? false });

    const { data: fieldsData, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('position');

    if (!fieldsError && fieldsData) {
      setFields(fieldsData as FormField[]);
    }

    setLoading(false);
  };

  const handleInputChange = (fieldId: string, value: string | boolean | string[]) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleMultipleChoiceChange = (fieldId: string, option: string, checked: boolean) => {
    const current = (formValues[fieldId] as string[]) || [];
    if (checked) {
      handleInputChange(fieldId, [...current, option]);
    } else {
      handleInputChange(fieldId, current.filter((o) => o !== option));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Form submitted successfully! (Preview mode)');
    console.log('Form values:', formValues);
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
            value={(formValues[field.id] as string) || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseInputClass}
            value={(formValues[field.id] as string) || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={(formValues[field.id] as boolean) || false}
              onCheckedChange={(checked) => handleInputChange(field.id, !!checked)}
            />
            <span className="text-sm text-foreground">{field.placeholder || 'Check this option'}</span>
          </div>
        );
      case 'date':
        return (
          <Input 
            type="date" 
            className={baseInputClass}
            value={(formValues[field.id] as string) || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'file':
        return (
          <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <input 
              type="file" 
              className="hidden" 
              id={`file-${field.id}`}
              onChange={(e) => handleInputChange(field.id, e.target.files?.[0]?.name || '')}
            />
            <label htmlFor={`file-${field.id}`} className="cursor-pointer">
              <p className="text-muted-foreground text-sm">Drop files here or click to upload</p>
            </label>
          </div>
        );
      case 'dropdown':
        return (
          <select 
            className={`w-full p-2 rounded-md ${baseInputClass} text-foreground`}
            value={(formValues[field.id] as string) || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          >
            <option value="">Select an option</option>
            {(Array.isArray(field.options) ? field.options : []).map((opt, i) => (
              <option key={i} value={String(opt)}>{String(opt)}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {(Array.isArray(field.options) ? field.options : ['Option 1', 'Option 2']).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name={field.id}
                  value={String(opt)}
                  checked={(formValues[field.id] as string) === String(opt)}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">{String(opt)}</span>
              </div>
            ))}
          </div>
        );
      case 'multiplechoice':
        return (
          <div className="space-y-2">
            {(Array.isArray(field.options) ? field.options : ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => {
              const currentValues = (formValues[field.id] as string[]) || [];
              return (
                <div key={i} className="flex items-center gap-2">
                  <Checkbox 
                    checked={currentValues.includes(String(opt))}
                    onCheckedChange={(checked) => handleMultipleChoiceChange(field.id, String(opt), !!checked)}
                  />
                  <span className="text-sm text-foreground">{String(opt)}</span>
                </div>
              );
            })}
          </div>
        );
      default:
        return (
          <Input 
            className={baseInputClass}
            value={(formValues[field.id] as string) || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground font-inter">Loading...</div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: form.settings.backgroundColor,
        fontFamily: form.settings.fontFamily
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-8 border border-border/30">
          {form.settings.logoUrl && (
            <div className="mb-6 flex justify-center">
              <img 
                src={form.settings.logoUrl} 
                alt="Form logo" 
                className="max-h-20 object-contain"
              />
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This form has no fields yet.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              <Button 
                type="submit" 
                className="w-full mt-8"
                style={{ backgroundColor: form.settings.primaryColor }}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground/50">Preview Mode</p>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;
