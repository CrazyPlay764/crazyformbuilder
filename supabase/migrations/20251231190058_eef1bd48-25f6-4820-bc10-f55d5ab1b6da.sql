-- Fix anon insert failing due to RLS on referenced tables by using a SECURITY DEFINER helper

create or replace function public.response_belongs_to_published_form(_response_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.form_responses fr
    join public.forms f on f.id = fr.form_id
    where fr.id = _response_id
      and f.is_published = true
  );
$$;

grant execute on function public.response_belongs_to_published_form(uuid) to anon, authenticated;

-- Replace policy to avoid subqueries that are blocked by RLS
DROP POLICY IF EXISTS "Anyone can insert response values" ON public.form_response_values;

CREATE POLICY "Anyone can insert response values"
ON public.form_response_values
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (length(COALESCE(value, ''::text)) <= 10000)
  AND (length(field_label) <= 500)
  AND public.response_belongs_to_published_form(response_id)
);
