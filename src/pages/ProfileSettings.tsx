import { useLanguage } from '@/i18n/Language';
import { useLanguage } from '@/i18n/Language';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ProfileSettings = () => {
  const { t, language } = useLanguage();
  const { t, language } = useLanguage();
  const { user, profile, loading, updateDisplayName, updatePassword, checkDisplayNameAvailable, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Delete account state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const handleSubmitName = async (e: React.FormEvent) => {
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

    setIsSubmittingName(true);
    const { error } = await updateDisplayName(displayName);
    setIsSubmittingName(false);

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

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsSubmittingPassword(false);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setNewPassword('');
      setConfirmPassword('');
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
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />{t("Back to Dashboard")}</Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("Profile Settings")}</CardTitle>
            <CardDescription>{t("Manage your account settings and preferences")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitName} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">{t("Your email address cannot be changed.")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">{t("Display Name")}</Label>
                <div className="relative">
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("Enter your display name")}
                    minLength={3}
                    maxLength={50}
                  />
                  {displayName.length >= 3 && profile?.display_name?.toLowerCase() !== displayName.toLowerCase() && (
                    <div className=t("absolute right-3 top-1/2 -translate-y-1/2")>
                      {nameStatus === t("checking"){t("g\") && (")}<Loader2 className=t{t("(\"h-4 w-4 animate-spin text-muted-foreground\")d\") /> )}")}{nameStatus === t("available"){t("e\") && (")}<Check className=t{t("(\"h-4 w-4 text-green-500\")0\") /> )}")}{nameStatus === t("taken"){t("n\") && (")}<X className=t{t("(\"h-4 w-4 text-destructive\")e\") /> )}")}</div>
                  )}
                </div>
                {nameStatus === t("available") && (
                  <p className=t("text-sm text-green-500")>{t("This name is available!")}</p>
                )}
                {nameStatus === t("taken") && (
                  <p className=t("text-sm text-destructive")>{t("This name is already taken.")}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingName || nameStatus === t("taken") || nameStatus === t("checking")}
                className="w-full"
              >
                {isSubmittingName ? (
                  <>
                    <Loader2 className=t{t("(\"h-4 w-4 mr-2 animate-spin\") />")}{t("Saving...")}</>
                ) : (
                  t("Save Display Name")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Change Password")}</CardTitle>
            <CardDescription>{t("Update your password to keep your account secure")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("New Password")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? t("text") : t("password")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("Enter new password")}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className=t("h-4 w-4 text-muted-foreground") />
                    ) : (
                      <Eye className=t{t("(\"h-4 w-4 text-muted-foreground\") /> )}")}</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("Confirm New Password")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? t("text") : t("password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("Confirm new password")}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className=t("h-4 w-4 text-muted-foreground") />
                    ) : (
                      <Eye className=t{t("(\"h-4 w-4 text-muted-foreground\") /> )}")}</Button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className=t("text-sm text-destructive")>{t("Passwords don't match")}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full"
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 className=t{t("(\"h-4 w-4 mr-2 animate-spin\") />")}{t("Updating...")}</>
                ) : (
                  t("Update Password")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />{t("Delete Account")}</CardTitle>
            <CardDescription>{t("Permanently delete your account and all associated data. This action cannot be undone.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">{t("Delete My Account")}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>{t("This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:")}</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>{t("All your forms")}</li>
                      <li>{t("All form responses")}</li>
                      <li>{t("Your profile information")}</li>
                    </ul>
                    <div className="pt-2">
                      <Label htmlFor="deleteConfirm" className="text-foreground">{t("Type")}<span className="font-semibold">DELETE</span>{t("to confirm")}</Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="mt-2"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>{t("Cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    onClick={async (e) => {
                      e.preventDefault();
                      setIsDeleting(true);
                      const { error } = await deleteAccount();
                      setIsDeleting(false);
                      
                      if (error) {
                        toast({
                          title: "Deletion failed",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Account deleted",
                          description: "Your account has been permanently deleted.",
                        });
                        navigate('/');
                      }
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className=t{t("(\"h-4 w-4 mr-2 animate-spin\") />")}{t("Deleting...")}</>
                    ) : (
                      t("Delete Account")
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
