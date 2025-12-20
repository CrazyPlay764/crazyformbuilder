-- Drop existing problematic policies on forms
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update their own forms or collaborator forms" ON public.forms;

-- Create simplified policies without circular references
CREATE POLICY "Users can view their own forms" 
ON public.forms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaborator forms"
ON public.forms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = id 
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

CREATE POLICY "Users can update their own forms" 
ON public.forms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update collaborator forms"
ON public.forms
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = id 
    AND fc.role = 'editor'
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  )
);

-- Drop and recreate form_collaborators policies to avoid circular reference
DROP POLICY IF EXISTS "Form owners can view collaborators" ON public.form_collaborators;

CREATE POLICY "Form owners can view collaborators" 
ON public.form_collaborators 
FOR SELECT 
USING (
  invited_by = auth.uid() 
  OR user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
);