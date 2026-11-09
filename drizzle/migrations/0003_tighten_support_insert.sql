DROP POLICY IF EXISTS support_insert_anyone ON public.support_requests;
CREATE POLICY support_insert_anon ON public.support_requests FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND status = 'open' AND length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(subject) <= 300 AND length(message) BETWEEN 1 AND 5000);
CREATE POLICY support_insert_authenticated ON public.support_requests FOR INSERT TO authenticated
WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND status = 'open' AND length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(subject) <= 300 AND length(message) BETWEEN 1 AND 5000);