-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to documents table
ALTER TABLE public.documents 
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Update existing records to have updated_at = created_at
UPDATE public.documents 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL
ALTER TABLE public.documents 
ALTER COLUMN updated_at SET NOT NULL;

-- Create trigger for automatic timestamp updates on documents table
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();