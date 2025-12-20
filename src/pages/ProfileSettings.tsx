import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { user, profile, loading, updateDisplayName, checkDisplayNameAvailable } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  useEffect(() => {
    if (!displayName || displayName.length < 3) {
      setNameStatus('idle');
      return;
    }

    // Don't check if it's the same as current name (case insensitive)
    if (profile?.display_name?.toLowerCase() === displayName.toLowerCase()) {
      setNameStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setNameStatus('checking');
      const isAvailable = await checkDisplayNameAvailable(displayName);
      setNameStatus(isAvailable ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [displayName, checkDisplayNameAvailable, profile?.display_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || displayName.length < 3) {
      toast({
        title: "Invalid name",
        description: "Display name must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    if (nameStatus === 'taken') {
      toast({
        title: "Name taken",
        description: "This display name is already in use.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await updateDisplayName(displayName);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your display name has been updated successfully.",
      });
      setNameStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    minLength={3}
                    maxLength={50}
                  />
                  {displayName.length >= 3 && profile?.display_name?.toLowerCase() !== displayName.toLowerCase() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {nameStatus === 'checking' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {nameStatus === 'available' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {nameStatus === 'taken' && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {nameStatus === 'available' && (
                  <p className="text-sm text-green-500">This name is available!</p>
                )}
                {nameStatus === 'taken' && (
                  <p className="text-sm text-destructive">This name is already taken.</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || nameStatus === 'taken' || nameStatus === 'checking'}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
