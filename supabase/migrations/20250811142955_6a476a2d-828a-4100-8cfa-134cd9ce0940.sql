-- Create documents table for persistent storage
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph","content":[]}]}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access to documents (since no auth is implemented yet)
CREATE POLICY "Anyone can view documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update documents" 
ON public.documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete documents" 
ON public.documents 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the default welcome document
INSERT INTO public.documents (id, title, content) VALUES (
  '1',
  'Welcome to Your Notion-like Editor',
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Welcome to Your Notion-like Editor"}]},{"type":"paragraph","content":[{"type":"text","text":"This is a powerful document editor that supports "},{"type":"text","marks":[{"type":"bold"}],"text":"rich text formatting"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"highlight","attrs":{"color":"#ffeb3b"}}],"text":"highlights"},{"type":"text","text":", equations, citations, and much more!"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Features"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Rich text editing with formatting options"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Code blocks with syntax highlighting"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Mathematical equations with LaTeX support"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Multiple highlight colors"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Image support"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Citation management"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Try creating a new document to get started! Your documents are now saved to the database and will persist across page refreshes."}]}]}'
);