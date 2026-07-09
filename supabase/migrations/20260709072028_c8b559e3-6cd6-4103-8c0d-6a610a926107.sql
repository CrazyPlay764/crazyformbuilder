
-- 1) forms: hide user_id from anonymous public viewers via column-level privileges.
REVOKE SELECT ON public.forms FROM anon;
GRANT SELECT (id, title, description, settings, is_published, created_at, updated_at)
  ON public.forms TO anon;

-- 2) form_responses: block anon SELECT entirely (INSERT still allowed by policy),
--    and tighten INSERT to require the target form to be published.
REVOKE SELECT ON public.form_responses FROM anon;

DROP POLICY IF EXISTS "Anyone can submit form responses" ON public.form_responses;
CREATE POLICY "Anyone can submit responses to published forms"
  ON public.form_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_responses.form_id
        AND f.is_published = true
    )
  );

-- 3) form_response_values: add basic rate limiting via a security definer helper.
CREATE OR REPLACE FUNCTION public.form_submission_rate_ok(_response_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.form_responses fr
    WHERE fr.form_id = (
      SELECT form_id FROM public.form_responses WHERE id = _response_id
    )
    AND fr.submitted_at > now() - interval '1 minute'
  ) <= 30;
$$;

REVOKE EXECUTE ON FUNCTION public.form_submission_rate_ok(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.form_submission_rate_ok(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can insert response values" ON public.form_response_values;
CREATE POLICY "Anyone can insert response values"
  ON public.form_response_values
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(COALESCE(value, ''::text)) <= 10000
    AND length(field_label) <= 500
    AND public.response_belongs_to_published_form(response_id)
    AND public.form_submission_rate_ok(response_id)
  );
