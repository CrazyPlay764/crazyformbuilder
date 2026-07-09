import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Mail, Lock, ArrowLeft, User, Check, X, Loader2 } from 'lucide-react';
import { z } from 'zod';
import {
  getLockRemainingMs,
  recordFailure,
  resetAttempts,
  formatRemaining,
} from '@/lib/auth-throttle';

const strongPassword = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a digit')
  .regex(/[^A-Za-z0-9]/, 'Must include a symbol');

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: strongPassword,
  displayName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[\p{L}\p{N}_.\- ]+$/u, 'Name contains invalid characters'),
});

const resetSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNameAvailable, setDisplayNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(getLockRemainingMs());
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string; confirmPassword?: string }>({});
  const { signIn, signUp, user, checkDisplayNameAvailable, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/dashboard');
    }
  }, [user, navigate, mode]);

  // Tick the lockout countdown once per second while locked.
  useEffect(() => {
    if (lockRemaining <= 0) return;
    const t = setInterval(() => setLockRemaining(getLockRemainingMs()), 1000);
    return () => clearInterval(t);
  }, [lockRemaining]);

  // Debounced display name availability check
  useEffect(() => {
    if (mode !== 'signup' || displayName.length < 2) {
      setDisplayNameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCheckingName(true);
      const isAvailable = await checkDisplayNameAvailable(displayName);
      setDisplayNameAvailable(isAvailable);
      setCheckingName(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [displayName, mode, checkDisplayNameAvailable]);

  const handlePasswordUpdate = async () => {
    const validation = resetSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully! You can now log in.');
        await supabase.auth.signOut();
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        navigate('/auth', { replace: true });
      }
    } catch (err) {
      toast.error('Failed to update password');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === 'forgot') {
      if (!email) {
        setErrors({ email: 'Email is required' });
        return;
      }
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        toast.success('Password reset email sent! Check your inbox and click the link to reset your password.');
        setMode('login');
      }
      return;
    }

    if (mode === 'reset') {
      await handlePasswordUpdate();
      return;
    }


    // Global lockout gate for login/signup
    if ((mode === 'login' || mode === 'signup') && getLockRemainingMs() > 0) {
      setLockRemaining(getLockRemainingMs());
      toast.error(`Too many attempts. Try again in ${formatRemaining(getLockRemainingMs())}.`);
      return;
    }

    if (mode === 'login') {
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const fieldErrors: { email?: string; password?: string } = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) {
        recordFailure();
        setLockRemaining(getLockRemainingMs());
        toast.error(error.message || 'Failed to sign in');
      } else {
        resetAttempts();
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } else if (mode === 'signup') {
      const validation = signupSchema.safeParse({ email, password, displayName });
      if (!validation.success) {
        const fieldErrors: { email?: string; password?: string; displayName?: string } = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
          if (err.path[0] === 'displayName') fieldErrors.displayName = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      const { error } = await signUp(email, password, displayName);
      if (error) {
        recordFailure();
        setLockRemaining(getLockRemainingMs());
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message || 'Failed to sign up');
        }
      } else {
        resetAttempts();
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    }

    setLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Forgot Password';
      case 'reset': return 'Set New Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to continue building forms';
      case 'signup': return 'Sign up to start building forms';
      case 'forgot': return 'Enter your email to receive a reset link';
      case 'reset': return 'Enter your new password';
    }
  };

  const isLocked = (mode === 'login' || mode === 'signup') && lockRemaining > 0;

  const getButtonText = () => {
    if (isLocked) return `Locked (${formatRemaining(lockRemaining)})`;
    if (loading) return 'Loading...';
    switch (mode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'forgot': return 'Continue';
      case 'reset': return 'Update Password';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">


      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
        
        <div className="glass glow-border rounded-2xl p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-orbitron font-bold gradient-text">FormBuilder</span>
          </div>

          <h1 className="text-2xl font-orbitron font-bold text-center text-foreground mb-2">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-center mb-8 font-inter">
            {getSubtitle()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">Your Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="crazyplay"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary"
                  />
                  {displayName.length >= 2 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingName ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : displayNameAvailable === true ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : displayNameAvailable === false ? (
                        <X className="w-5 h-5 text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
                {errors.displayName && <p className="text-destructive text-sm">{errors.displayName}</p>}
                {displayNameAvailable === false && !errors.displayName && (
                  <p className="text-destructive text-sm">This name is already taken</p>
                )}
                {displayNameAvailable === true && (
                  <p className="text-green-500 text-sm">This name is available!</p>
                )}
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              variant="glow" 
              className="w-full" 
              disabled={loading || isLocked}
            >
              {getButtonText()}
            </Button>
          </form>

          {mode === 'forgot' && (
            <p className="text-center text-muted-foreground mt-6 font-inter">
              Remember your password?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <p className="text-center text-muted-foreground mt-6 font-inter">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrors({});
                }}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
