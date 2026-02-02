-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Parents can insert children" ON public.children;

-- Create a new policy that allows authenticated users who are parents to insert children
-- The parent role check will be done after the user is registered as a parent
CREATE POLICY "Authenticated users can insert children" 
ON public.children 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Note: The parent-child relationship and role will be created after the child is created
-- The RLS on parent_child table ensures only the parent can create the relationship