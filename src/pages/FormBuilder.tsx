import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Save, Share2, Sparkles, Palette, Eye, EyeOff, AlertCircle, Play, MessageSquare, Monitor, Tablet, Smartphone, Lock } from 'lucide-react';
import FieldPalette from '@/components/FormBuilder/FieldPalette';
import FormCanvas from '@/components/FormBuilder/FormCanvas';
import FieldSettings from '@/components/FormBuilder/FieldSettings';
import FormSettings from '@/components/FormBuilder/FormSettings';
import FormResponses from '@/components/FormBuilder/FormResponses';
import FormPreviewModal from '@/components/FormBuilder/FormPreviewModal';
import ShareDialog from '@/components/FormBuilder/ShareDialog';
import { FormField, Form } from '@/types/form';

const FormBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedFieldType, setDraggedFieldType] = useState<{ type: string; label: string } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer'>('owner');
  const initialFormRef = useRef<string | null>(null);

  const isReadOnly = userRole === 'viewer';
  const isOwner = userRole === 'owner';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchForm();
      fetchFields();
      determineUserRole();
    }
  }, [user, id]);

  const determineUserRole = async () => {
    // Check if user is the owner
    const { data: formData } = await supabase
      .from('forms')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (formData?.user_id === user?.id) {
      setUserRole('owner');
      return;
    }

    // Check URL param for role hint
    const roleParam = searchParams.get('role');
    if (roleParam === 'viewer' || roleParam === 'editor') {
      setUserRole(roleParam);
      return;
    }

    // Check collaborator status
    const { data: collab } = await supabase
      .from('form_collaborators')
      .select('role')
      .eq('form_id', id)
      .or(`user_id.eq.${user?.id},email.eq.${user?.email}`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (collab) {
      setUserRole(collab.role as 'editor' | 'viewer');
    }
  };

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
      {/* Read-only banner for viewers */}
      {isReadOnly && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 px-4 py-2">
          <div className="container mx-auto flex items-center justify-center gap-2 text-amber-200">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-inter">You have view-only access to this form</span>
          </div>
        </div>
      )}
      
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
            {!isOwner && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                userRole === 'editor' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-amber-500/20 text-amber-200'
              }`}>
                {userRole === 'editor' ? 'Editor' : 'Viewer'}
              </span>
            )}
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
              variant={showPreview ? 'glow' : 'ghost'} 
              size="sm"
              onClick={() => {
                setShowPreview(!showPreview);
                setShowFormSettings(false);
                setShowResponses(false);
                setSelectedField(null);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            {!isReadOnly && (
              <>
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
              </>
            )}
            
            
            
            {!isReadOnly && (
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
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Field palette - only for editors/owners */}
          {!isReadOnly && (
            <div className="w-64 shrink-0">
              <FieldPalette onDragStart={handleDragStart} onAddField={handleAddField} />
            </div>
          )}
          
          <FormCanvas
            fields={fields}
            formSettings={form.settings}
            onDrop={isReadOnly ? () => {} : handleDrop}
            onDragOver={isReadOnly ? () => {} : handleDragOver}
            onDeleteField={isReadOnly ? () => {} : handleDeleteField}
            onSelectField={isReadOnly ? () => {} : (field) => {
              setSelectedField(field);
              setShowFormSettings(false);
            }}
            selectedFieldId={isReadOnly ? null : selectedField?.id || null}
            onReorderFields={isReadOnly ? () => {} : handleReorderFields}
            previewDevice={previewDevice}
          />

          {/* Settings panel - only for editors/owners */}
          {!isReadOnly && (
            <div className="w-72 shrink-0">
              {selectedField ? (
                <FieldSettings field={selectedField} onUpdate={handleUpdateField} />
              ) : (
                <div className="glass rounded-xl p-4">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Share2 className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm font-inter">
                      Share your form with others
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShareOpen(true)}
                      className="w-full"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Form
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Responses Panel - slides in as overlay */}
      <FormResponses 
        formId={form.id} 
        isOpen={showResponses} 
        onClose={() => setShowResponses(false)} 
      />

      {/* Design Panel - centered modal */}
      <FormSettings
        settings={form.settings}
        onUpdate={updateFormSettings}
        title={form.title}
        onTitleChange={updateFormTitle}
        description={form.description || ''}
        onDescriptionChange={updateFormDescription}
        isOpen={showFormSettings}
        onClose={() => setShowFormSettings(false)}
      />

      {/* Preview Modal */}
      <FormPreviewModal
        formId={form.id}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {isOwner && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          formId={form.id}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
};

export default FormBuilder;
