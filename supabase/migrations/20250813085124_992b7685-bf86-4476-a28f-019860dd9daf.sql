-- Add user_id column to documents table
ALTER TABLE public.documents 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing documents to have a placeholder user_id (you may want to handle this differently)
-- For now, we'll leave them NULL and handle in the application

-- Drop existing public policies
DROP POLICY IF EXISTS "Allow public delete" ON public.documents;
DROP POLICY IF EXISTS "Allow public insert" ON public.documents;
DROP POLICY IF EXISTS "Allow public read access" ON public.documents;
DROP POLICY IF EXISTS "Allow public update" ON public.documents;

-- Create secure RLS policies that require authentication and user ownership
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);