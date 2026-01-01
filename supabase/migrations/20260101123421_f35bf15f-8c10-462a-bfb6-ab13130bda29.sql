-- Allow invited users to decline (delete) their own pending invites
CREATE POLICY "Invited users can decline their invites" 
ON public.form_collaborators 
FOR DELETE 
USING (email = get_current_user_email() AND status = 'pending');