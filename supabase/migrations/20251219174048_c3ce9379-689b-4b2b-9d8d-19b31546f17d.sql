-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT,
  settings JSONB DEFAULT '{"backgroundColor": "#1a1a2e", "fontFamily": "Inter", "primaryColor": "#8b5cf6"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Form fields table
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

-- Form collaborators table
CREATE TABLE public.form_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, email)
);

ALTER TABLE public.form_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms (owner or collaborator can access)
CREATE POLICY "Users can view their own forms" ON public.forms
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.form_collaborators 
      WHERE form_id = forms.id 
      AND (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can create forms" ON public.forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms or collaborator forms" ON public.forms
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.form_collaborators 
      WHERE form_id = forms.id 
      AND (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
      AND role = 'editor'
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can delete their own forms" ON public.forms
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for form_fields (inherit from form access)
CREATE POLICY "Users can view form fields" ON public.form_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms WHERE id = form_id AND (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.form_collaborators 
          WHERE form_collaborators.form_id = forms.id 
          AND status = 'accepted'
          AND (form_collaborators.user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      )
    )
  );

CREATE POLICY "Users can insert form fields" ON public.form_fields
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms WHERE id = form_id AND (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.form_collaborators 
          WHERE form_collaborators.form_id = forms.id 
          AND role = 'editor' AND status = 'accepted'
          AND (form_collaborators.user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      )
    )
  );

CREATE POLICY "Users can update form fields" ON public.form_fields
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.forms WHERE id = form_id AND (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.form_collaborators 
          WHERE form_collaborators.form_id = forms.id 
          AND role = 'editor' AND status = 'accepted'
          AND (form_collaborators.user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      )
    )
  );

CREATE POLICY "Users can delete form fields" ON public.form_fields
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.forms WHERE id = form_id AND (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.form_collaborators 
          WHERE form_collaborators.form_id = forms.id 
          AND role = 'editor' AND status = 'accepted'
          AND (form_collaborators.user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        )
      )
    )
  );

-- RLS for collaborators
CREATE POLICY "Form owners can view collaborators" ON public.form_collaborators
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.forms WHERE id = form_id AND user_id = auth.uid())
    OR user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Form owners can add collaborators" ON public.form_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.forms WHERE id = form_id AND user_id = auth.uid())
  );

CREATE POLICY "Form owners can remove collaborators" ON public.form_collaborators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.forms WHERE id = form_id AND user_id = auth.uid())
  );

CREATE POLICY "Collaborators can accept invites" ON public.form_collaborators
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();