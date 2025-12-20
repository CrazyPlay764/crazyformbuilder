-- Create table for form responses (each submission)
CREATE TABLE public.form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  respondent_email TEXT
);

-- Create table for individual field values in each response
CREATE TABLE public.form_response_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  value TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_response_values ENABLE ROW LEVEL SECURITY;

-- Anyone can submit responses (insert)
CREATE POLICY "Anyone can submit form responses"
ON public.form_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.is_published = true
  )
);

-- Form owners can view responses
CREATE POLICY "Form owners can view responses"
ON public.form_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.user_id = auth.uid()
  )
);

-- Form owners can delete responses
CREATE POLICY "Form owners can delete responses"
ON public.form_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.user_id = auth.uid()
  )
);

-- Anyone can insert response values (for their submission)
CREATE POLICY "Anyone can insert response values"
ON public.form_response_values
FOR INSERT
WITH CHECK (true);

-- Form owners can view response values
CREATE POLICY "Form owners can view response values"
ON public.form_response_values
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM form_responses
    JOIN forms ON forms.id = form_responses.form_id
    WHERE form_responses.id = form_response_values.response_id
    AND forms.user_id = auth.uid()
  )
);

-- Form owners can delete response values
CREATE POLICY "Form owners can delete response values"
ON public.form_response_values
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM form_responses
    JOIN forms ON forms.id = form_responses.form_id
    WHERE form_responses.id = form_response_values.response_id
    AND forms.user_id = auth.uid()
  )
);