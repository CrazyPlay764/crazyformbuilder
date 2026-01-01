import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Send, LogIn, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { FormField, Form } from '@/types/form';

const FormPreview = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEmbed = searchParams.get('embed') === 'true';
  
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formClosed, setFormClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string | boolean | string[]>>({});

  const ensureBackendConfig = () => {
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) return true;
    toast.error(
      'כדי שהטופס יעבוד ב‑Vercel צריך להגדיר Environment Variables: VITE_SUPABASE_URL ו‑VITE_SUPABASE_PUBLISHABLE_KEY ואז לבצע Redeploy.'
    );
    return false;
  };

  const createResponseId = (): string => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

    const cryptoObj = globalThis.crypto;
    if (cryptoObj?.getRandomValues) {
      const bytes = new Uint8Array(16);
      cryptoObj.getRandomValues(bytes);

      // RFC 4122 version 4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  // Calculate progress
  const progressInfo = useMemo(() => {
    const totalFields = fields.length;
    if (totalFields === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completedFields = fields.filter((field) => {
      const value = formValues[field.id];
      if (value === undefined || value === null) return false;
      if (typeof value === 'boolean') return value === true;
      if (Array.isArray(value)) return value.length > 0;
      return String(value).trim() !== '';
    }).length;

    return {
      completed: completedFields,
      total: totalFields,
      percentage: Math.round((completedFields / totalFields) * 100),
    };
  }, [fields, formValues]);

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id]);

  const fetchFormData = async () => {
    if (!ensureBackendConfig()) {
      setLoading(false);
      return;
    }

    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (formError || !formData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

const settings = typeof formData.settings === 'object' && formData.settings !== null
      ? formData.settings as { backgroundColor: string; fontFamily: string; primaryColor: string; logoUrl?: string; submitButtonText?: string; successMessage?: string; closedFormMessage?: string; gradientDirection?: string; gradientEndColor?: string }
      : { backgroundColor: '#1a1a2e', fontFamily: 'Inter', primaryColor: '#8b5cf6' };

    // Check if form is closed (not published)
    if (!formData.is_published) {
      setFormClosed(true);
      setClosedMessage(settings.closedFormMessage || 'This form is currently closed.');
      setLoading(false);
      return;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form || !id) return;
    if (!ensureBackendConfig()) return;

    try {
      // Create the response record without selecting it back (anon users can't SELECT due to RLS)
      const responseId = createResponseId();

      const { error: responseError } = await supabase
        .from('form_responses')
        .insert({ id: responseId, form_id: id });

      if (responseError) {
        console.error('Error submitting form:', responseError);
        toast.error(responseError.message || 'Failed to submit form');
        return;
      }

      // Insert all field values
      const responseValues = fields.map((field) => ({
        response_id: responseId,
        field_id: field.id,
        field_label: field.label,
        field_type: field.type,
        value: Array.isArray(formValues[field.id])
          ? (formValues[field.id] as string[]).join(', ')
          : String(formValues[field.id] ?? ''),
        position: field.position,
      }));

      const { error: valuesError } = await supabase
        .from('form_response_values')
        .insert(responseValues);

      if (valuesError) {
        console.error('Error saving response values:', valuesError);
        toast.error(valuesError.message || 'Failed to submit form');
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message || 'Failed to submit form');
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

  if (formClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-orbitron font-bold text-foreground">Form Closed</h1>
          <p className="text-muted-foreground">{closedMessage}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-orbitron font-bold text-foreground">Form Not Found</h1>
          <p className="text-muted-foreground">This form doesn't exist.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Link to="/auth">
              <Button variant="glow">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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

  const hasGradient = form.settings.gradientDirection && form.settings.gradientDirection !== 'none';
  const backgroundStyle = hasGradient
    ? { background: getGradientStyle(form.settings.gradientDirection!, form.settings.backgroundColor, form.settings.gradientEndColor || '#4a1d96') }
    : { backgroundColor: form.settings.backgroundColor };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        ...backgroundStyle,
        fontFamily: form.settings.fontFamily
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {!isEmbed && (
          <div className="mb-6 flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        )}

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

          {submitted ? (
            <div className="text-center py-12 space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-orbitron font-bold text-foreground">
                {form.settings.successMessage || 'Thank you! Your form has been submitted successfully.'}
              </h2>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This form has no fields yet.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {progressInfo.completed} / {progressInfo.total} completed
                  </span>
                </div>
                <Progress value={progressInfo.percentage} className="h-2" />
              </div>

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
                {form.settings.submitButtonText || 'Submit'}
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
