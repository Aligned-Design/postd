-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON public.workspaces(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
-- Users can view workspaces where they are members
CREATE POLICY "Users can view their workspaces"
    ON public.workspaces
    FOR SELECT
    USING (
        id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert workspaces (they become owner via trigger)
CREATE POLICY "Users can create workspaces"
    ON public.workspaces
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Only workspace owners can update workspaces
CREATE POLICY "Workspace owners can update their workspaces"
    ON public.workspaces
    FOR UPDATE
    USING (
        id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Only workspace owners can delete workspaces
CREATE POLICY "Workspace owners can delete their workspaces"
    ON public.workspaces
    FOR DELETE
    USING (
        id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for workspace_members
-- Users can view members of workspaces they belong to
CREATE POLICY "Users can view members of their workspaces"
    ON public.workspace_members
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Workspace owners can add members
CREATE POLICY "Workspace owners can add members"
    ON public.workspace_members
    FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Workspace owners can remove members
CREATE POLICY "Workspace owners can remove members"
    ON public.workspace_members
    FOR DELETE
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on workspaces
CREATE TRIGGER update_workspaces_updated_at 
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.workspaces TO authenticated;
GRANT ALL ON public.workspace_members TO authenticated;

