-- Fix workspace_members RLS to allow initial owner insertion
-- 
-- Problem: The original "Workspace owners can add members" policy prevented
-- the initial owner from being added because you had to already be an owner
-- to insert into workspace_members (chicken-and-egg problem).
--
-- Solution: Allow inserting yourself as owner when creating a workspace you own.

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Workspace owners can add members" ON public.workspace_members;

-- Create a new policy that allows:
-- 1. Workspace owners to add members (existing behavior)
-- 2. Users to add themselves as owner when they create the workspace
CREATE POLICY "Users can add members to their workspaces"
    ON public.workspace_members
    FOR INSERT
    WITH CHECK (
        -- Allow if you're adding yourself as owner to a workspace you created
        (user_id = auth.uid() AND role = 'owner' AND workspace_id IN (
            SELECT id FROM public.workspaces WHERE created_by = auth.uid()
        ))
        OR
        -- Allow if you're already an owner of this workspace (for adding other members)
        (workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        ))
    );

