-- Enable Row Level Security on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- For now, create a policy that allows anyone to read documents
-- In a real app, you'd want to restrict this to authenticated users
CREATE POLICY "Allow public read access" 
ON public.documents 
FOR SELECT 
USING (true);

-- Allow anyone to insert documents (for testing)
CREATE POLICY "Allow public insert" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update documents (for testing)
CREATE POLICY "Allow public update" 
ON public.documents 
FOR UPDATE 
USING (true);

-- Allow anyone to delete documents (for testing)  
CREATE POLICY "Allow public delete" 
ON public.documents 
FOR DELETE 
USING (true);