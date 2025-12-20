-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Anyone can submit form responses" ON public.form_responses;

-- Create a simpler policy that allows anyone to insert responses
-- The form_id foreign key constraint already ensures the form exists
CREATE POLICY "Anyone can submit form responses"
ON public.form_responses
FOR INSERT
WITH CHECK (true);