-- Drop problematic policies that reference auth.users directly
DROP POLICY IF EXISTS "Users can view collaborator forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update collaborator forms" ON public.forms;
DROP POLICY IF EXISTS "Form owners can view collaborators" ON public.form_collaborators;
DROP POLICY IF EXISTS "Collaborators can accept invites" ON public.form_collaborators;

-- Create a security definer function to safely get the current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view collaborator forms"
ON public.forms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = id 
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
  )
);

CREATE POLICY "Users can update collaborator forms"
ON public.forms
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = id 
    AND fc.role = 'editor'
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
  )
);

CREATE POLICY "Form owners can view collaborators" 
ON public.form_collaborators 
FOR SELECT 
USING (
  invited_by = auth.uid() 
  OR user_id = auth.uid() 
  OR email = public.get_current_user_email()
);

CREATE POLICY "Collaborators can accept invites"
ON public.form_collaborators
FOR UPDATE
USING (email = public.get_current_user_email());

-- Also fix form_fields policies that may have the same issue
DROP POLICY IF EXISTS "Users can view form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can insert form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can update form fields" ON public.form_fields;
DROP POLICY IF EXISTS "Users can delete form fields" ON public.form_fields;

-- Recreate form_fields policies without referencing auth.users
CREATE POLICY "Users can view form fields"
ON public.form_fields
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_fields.form_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
      )
    )
  )
);

CREATE POLICY "Users can insert form fields"
ON public.form_fields
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_fields.form_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.role = 'editor'
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
      )
    )
  )
);

CREATE POLICY "Users can update form fields"
ON public.form_fields
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_fields.form_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.role = 'editor'
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
      )
    )
  )
);

CREATE POLICY "Users can delete form fields"
ON public.form_fields
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_fields.form_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.role = 'editor'
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
      )
    )
  )
);