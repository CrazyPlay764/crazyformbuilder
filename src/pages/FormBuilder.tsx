import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Share2, Sparkles, Palette, Eye, EyeOff, AlertCircle, Play, MessageSquare, Monitor, Tablet, Smartphone } from 'lucide-react';
import FieldPalette from '@/components/FormBuilder/FieldPalette';
import FormCanvas from '@/components/FormBuilder/FormCanvas';
import FieldSettings from '@/components/FormBuilder/FieldSettings';
import FormSettings from '@/components/FormBuilder/FormSettings';
import FormResponses from '@/components/FormBuilder/FormResponses';
import ShareDialog from '@/components/FormBuilder/ShareDialog';
import { FormField, Form } from '@/types/form';

const FormBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedFieldType, setDraggedFieldType] = useState<{ type: string; label: string } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const initialFormRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchForm();
      fetchFields();
    }
  }, [user, id]);

  const fetchForm = async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast.error('Failed to load form');
      navigate('/dashboard');
    } else {
      const settings = typeof data.settings === 'object' && data.settings !== null
        ? data.settings as { backgroundColor: string; fontFamily: string; primaryColor: string; logoUrl?: string }
        : { backgroundColor: '#1a1a2e', fontFamily: 'Inter', primaryColor: '#8b5cf6' };
      
      const formData = { ...data, settings, is_published: data.is_published ?? false };
      setForm(formData);
      initialFormRef.current = JSON.stringify(formData);
    }
    setLoading(false);
  };

  const fetchFields = async () => {
    const { data, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('position');

    if (!error && data) {
      setFields(data as FormField[]);
    }
  };

  const handleDragStart = (type: string, label: string) => {
    setDraggedFieldType({ type, label });
  };

  const handleAddField = async (type: string, label: string) => {
    if (!id) return;

    const newField = {
      form_id: id,
      type: type,
      label: label,
      position: fields.length,
      required: false,
      options: type === 'dropdown' || type === 'radio' 
        ? ['Option 1', 'Option 2'] 
        : type === 'multiplechoice'
        ? ['Option 1', 'Option 2', 'Option 3']
        : null,
    };

    const { data, error } = await supabase
      .from('form_fields')
      .insert(newField)
      .select()
      .single();

    if (error) {
      toast.error('Failed to add field');
    } else {
      setFields([...fields, data as FormField]);
      toast.success('Field added');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFieldType || !id) return;

    const newField = {
      form_id: id,
      type: draggedFieldType.type,
      label: draggedFieldType.label,
      position: fields.length,
      required: false,
      options: draggedFieldType.type === 'dropdown' || draggedFieldType.type === 'radio' 
        ? ['Option 1', 'Option 2'] 
        : draggedFieldType.type === 'multiplechoice'
        ? ['Option 1', 'Option 2', 'Option 3']
        : null,
    };

    const { data, error } = await supabase
      .from('form_fields')
      .insert(newField)
      .select()
      .single();

    if (error) {
      toast.error('Failed to add field');
    } else {
      setFields([...fields, data as FormField]);
      toast.success('Field added');
    }
    setDraggedFieldType(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDeleteField = async (fieldId: string) => {
    const { error } = await supabase
      .from('form_fields')
      .delete()
      .eq('id', fieldId);

    if (error) {
      toast.error('Failed to delete field');
    } else {
      setFields(fields.filter((f) => f.id !== fieldId));
      if (selectedField?.id === fieldId) setSelectedField(null);
      toast.success('Field deleted');
    }
  };

  const handleUpdateField = async (updatedField: FormField) => {
    const { error } = await supabase
      .from('form_fields')
      .update({
        label: updatedField.label,
        placeholder: updatedField.placeholder,
        required: updatedField.required,
        options: updatedField.options as null,
      })
      .eq('id', updatedField.id);

    if (error) {
      toast.error('Failed to update field');
    } else {
      setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
      setSelectedField(updatedField);
    }
  };

  const handleReorderFields = async (dragIndex: number, dropIndex: number) => {
    const newFields = [...fields];
    const [removed] = newFields.splice(dragIndex, 1);
    newFields.splice(dropIndex, 0, removed);
    
    const reorderedFields = newFields.map((f, i) => ({ ...f, position: i }));
    setFields(reorderedFields);

    for (const field of reorderedFields) {
      await supabase
        .from('form_fields')
        .update({ position: field.position })
        .eq('id', field.id);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);

    const { error } = await supabase
      .from('forms')
      .update({
        title: form.title,
        description: form.description,
        settings: form.settings,
        is_published: form.is_published,
      })
      .eq('id', form.id);

    if (error) {
      toast.error('Failed to save form');
    } else {
      toast.success('Form saved');
      initialFormRef.current = JSON.stringify(form);
      setHasUnsavedChanges(false);
    }
    setSaving(false);
  };

  const togglePublish = () => {
    if (form) {
      const newForm = { ...form, is_published: !form.is_published };
      setForm(newForm);
      setHasUnsavedChanges(JSON.stringify(newForm) !== initialFormRef.current);
    }
  };

  const updateFormSettings = (settings: { 
    backgroundColor: string; 
    fontFamily: string; 
    primaryColor: string; 
    logoUrl?: string;
    gradientDirection?: string;
    gradientEndColor?: string;
    submitButtonText?: string;
    successMessage?: string;
    closedFormMessage?: string;
  }) => {
    if (form) {
      const newForm = { ...form, settings };
      setForm(newForm);
      setHasUnsavedChanges(JSON.stringify(newForm) !== initialFormRef.current);
    }
  };

  const updateFormTitle = (title: string) => {
    if (form) {
      const newForm = { ...form, title };
      setForm(newForm);
      setHasUnsavedChanges(JSON.stringify(newForm) !== initialFormRef.current);
    }
  };

  const updateFormDescription = (description: string) => {
    if (form) {
      const newForm = { ...form, description };
      setForm(newForm);
      setHasUnsavedChanges(JSON.stringify(newForm) !== initialFormRef.current);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground font-inter">Loading...</div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
            >
              <Sparkles className="w-6 h-6 text-primary transition-all duration-300 group-hover:scale-110" />
              <span className="font-orbitron font-semibold text-foreground group-hover:text-primary transition-colors">{form.title}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Device Preview Toggle */}
            <div className="flex items-center border border-border/50 rounded-lg p-0.5 mr-2">
              <Button
                variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('desktop')}
                title="Desktop view"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('tablet')}
                title="Tablet view"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile view"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(`/form/${id}`, '_blank')}
            >
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant={showFormSettings ? 'glow' : 'ghost'} 
              size="sm"
              onClick={() => {
                setShowFormSettings(!showFormSettings);
                setShowResponses(false);
                setSelectedField(null);
              }}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design
            </Button>
            <Button 
              variant={showResponses ? 'glow' : 'ghost'} 
              size="sm"
              onClick={() => {
                setShowResponses(!showResponses);
                setShowFormSettings(false);
                setSelectedField(null);
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Responses
            </Button>
            <Button 
              variant={form.is_published ? 'default' : 'outline'} 
              size="sm"
              onClick={togglePublish}
              className={form.is_published ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {form.is_published ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Open
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Closed
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="glow" 
              size="sm" 
              onClick={handleSave} 
              disabled={saving}
              className={hasUnsavedChanges ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}
            >
              {hasUnsavedChanges && <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />}
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save*' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-64 shrink-0">
            <FieldPalette onDragStart={handleDragStart} onAddField={handleAddField} />
          </div>
          
          <FormCanvas
            fields={fields}
            formSettings={form.settings}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDeleteField={handleDeleteField}
            onSelectField={(field) => {
              setSelectedField(field);
              setShowFormSettings(false);
            }}
            selectedFieldId={selectedField?.id || null}
            onReorderFields={handleReorderFields}
            previewDevice={previewDevice}
          />

          <div className="w-72 shrink-0">
            {showResponses ? (
              <FormResponses formId={form.id} />
            ) : showFormSettings ? (
              <FormSettings
                settings={form.settings}
                onUpdate={updateFormSettings}
                title={form.title}
                onTitleChange={updateFormTitle}
                description={form.description || ''}
                onDescriptionChange={updateFormDescription}
              />
            ) : selectedField ? (
              <FieldSettings field={selectedField} onUpdate={handleUpdateField} />
            ) : (
              <div className="glass rounded-xl p-4">
                <p className="text-muted-foreground text-sm font-inter text-center">
                  Select a field to edit its settings, or click Design to customize the form appearance.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        formId={form.id}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default FormBuilder;
