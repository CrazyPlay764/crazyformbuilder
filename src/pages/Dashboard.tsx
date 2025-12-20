import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Edit, LogOut, Sparkles, Pencil, Check, X, Eye, EyeOff, Settings } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, profile, signOut, updateDisplayName, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigateToSettings = () => {
    setIsExiting(true);
    setTimeout(() => navigate('/settings'), 300);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchForms();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.display_name) {
      setNewDisplayName(profile.display_name);
    }
  }, [profile]);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user?.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load forms');
    } else {
      setForms(data || []);
    }
    setLoading(false);
  };

  const createForm = async () => {
    const { data, error } = await supabase
      .from('forms')
      .insert({ user_id: user?.id, title: 'Untitled Form' })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create form');
    } else {
      toast.success('Form created!');
      navigate(`/builder/${data.id}`);
    }
  };

  const deleteForm = async (id: string) => {
    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete form');
    } else {
      toast.success('Form deleted');
      setForms(forms.filter((f) => f.id !== id));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    const { error } = await updateDisplayName(newDisplayName.trim());
    if (error) {
      toast.error('Failed to update name');
    } else {
      toast.success('Name updated!');
      setEditingName(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground font-inter">Loading...</div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email;

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <Sparkles className="w-7 h-7 text-primary transition-all duration-300 group-hover:scale-110" />
            <span className="text-xl font-orbitron font-bold gradient-text">Form Builder</span>
          </button>
          <div className="flex items-center gap-4">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-40 h-8 text-sm bg-background/50 border-border/50"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveDisplayName}>
                  <Check className="w-4 h-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingName(false)}>
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-inter">{displayName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingName(true)}>
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleNavigateToSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-orbitron font-bold text-foreground">My Forms</h1>
          <Button variant="glow" onClick={createForm}>
            <Plus className="w-5 h-5 mr-2" />
            Create Form
          </Button>
        </div>

        {forms.length === 0 ? (
          <div className="glass glow-border rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-orbitron font-semibold text-foreground mb-2">No forms yet</h2>
            <p className="text-muted-foreground font-inter mb-6">Create your first form to get started</p>
            <Button variant="glow" onClick={createForm}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Form
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div
                key={form.id}
                className="glass glow-border rounded-xl p-6 hover:bg-card/80 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/builder/${form.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteForm(form.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-orbitron font-semibold text-foreground mb-2">
                  {form.title}
                </h3>
                <p className="text-sm text-muted-foreground font-inter mb-3">
                  {form.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {form.is_published ? (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <Eye className="w-3 h-3" />
                        Open
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <EyeOff className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-inter">
                    {new Date(form.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
