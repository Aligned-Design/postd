-- Phase 2: Website Ingestion
-- Create sources table for tracking inbound data sources (website, social, etc.)
-- Create crawled_pages table for storing website content

-- Create sources table
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('website', 'instagram', 'tiktok', 'linkedin')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create crawled_pages table
CREATE TABLE IF NOT EXISTS public.crawled_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    content_text TEXT,
    raw_html TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sources_workspace_id ON public.sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sources_workspace_type ON public.sources(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_workspace_id ON public.crawled_pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_source_id ON public.crawled_pages(source_id);
CREATE INDEX IF NOT EXISTS idx_crawled_pages_url ON public.crawled_pages(url);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawled_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sources
-- Users can view sources for workspaces where they are members
CREATE POLICY "Users can view their workspace sources"
    ON public.sources
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert sources for their workspaces
CREATE POLICY "Users can create sources for their workspaces"
    ON public.sources
    FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update sources for their workspaces
CREATE POLICY "Users can update their workspace sources"
    ON public.sources
    FOR UPDATE
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can delete sources for their workspaces
CREATE POLICY "Users can delete their workspace sources"
    ON public.sources
    FOR DELETE
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for crawled_pages
-- Users can view crawled pages for workspaces where they are members
CREATE POLICY "Users can view their workspace crawled pages"
    ON public.crawled_pages
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- System can insert crawled pages (this happens server-side during crawling)
CREATE POLICY "System can create crawled pages"
    ON public.crawled_pages
    FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- System can update crawled pages
CREATE POLICY "System can update crawled pages"
    ON public.crawled_pages
    FOR UPDATE
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can delete crawled pages for their workspaces
CREATE POLICY "Users can delete their workspace crawled pages"
    ON public.crawled_pages
    FOR DELETE
    USING (
        workspace_id IN (
            SELECT workspace_id 
            FROM public.workspace_members 
            WHERE user_id = auth.uid()
        )
    );

-- Trigger to update updated_at on sources
CREATE TRIGGER update_sources_updated_at 
    BEFORE UPDATE ON public.sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.sources TO authenticated;
GRANT ALL ON public.crawled_pages TO authenticated;

