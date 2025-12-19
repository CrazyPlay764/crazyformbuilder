import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { z } from 'zod';

interface Collaborator {
  id: string;
  email: string;
  role: string;
  status: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  userId: string;
}

const emailSchema = z.string().email('Invalid email address');

const ShareDialog = ({ open, onOpenChange, formId, userId }: ShareDialogProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('editor');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open, formId]);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('form_collaborators')
      .select('*')
      .eq('form_id', formId);

    if (!error && data) {
      setCollaborators(data);
    }
  };

  const inviteCollaborator = async () => {
    setEmailError('');
    
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from('form_collaborators')
      .insert({
        form_id: formId,
        email: email.trim(),
        role,
        invited_by: userId,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This person has already been invited');
      } else {
        toast.error('Failed to send invitation');
      }
    } else {
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      fetchCollaborators();
    }
    setLoading(false);
  };

  const removeCollaborator = async (id: string) => {
    const { error } = await supabase
      .from('form_collaborators')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove collaborator');
    } else {
      toast.success('Collaborator removed');
      setCollaborators(collaborators.filter((c) => c.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-foreground">Share Form</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Invite by email</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="bg-background/50 border-border/50"
                  />
                  {emailError && <p className="text-destructive text-sm mt-1">{emailError}</p>}
                </div>
                <Select value={role} onValueChange={(v) => setRole(v as 'viewer' | 'editor')}>
                  <SelectTrigger className="w-24 bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="glow" onClick={inviteCollaborator} disabled={loading} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>

          {collaborators.length > 0 && (
            <div className="space-y-2">
              <Label className="text-foreground">Collaborators</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{collab.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {collab.role} • {collab.status}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCollaborator(collab.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
