-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert children" ON public.children;

-- Create a proper policy: allow insert only for users with 'parent' role
-- The role is assigned during signup
CREATE POLICY "Parents can insert children" 
ON public.children 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'parent'::user_role));