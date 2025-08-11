import { useState, useEffect } from 'react';
import { documentStore, type Document } from '@/lib/document-store';
import { toast } from '@/hooks/use-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentStore.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Error loading documents",
        description: "Failed to load your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const createDocument = async (title?: string) => {
    try {
      const newDoc = await documentStore.createDocument(title);
      if (newDoc) {
        await loadDocuments(); // Refresh the list
        return newDoc;
      }
    } catch (error) {
      toast({
        title: "Error creating document",
        description: "Failed to create a new document. Please try again.",
        variant: "destructive"
      });
    }
    return null;
  };

  const deleteDocument = async (id: string) => {
    try {
      const success = await documentStore.deleteDocument(id);
      if (success) {
        await loadDocuments(); // Refresh the list
        toast({
          title: "Document deleted",
          description: "Your document has been successfully deleted."
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Error deleting document",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive"
      });
    }
    return false;
  };

  return {
    documents,
    loading,
    createDocument,
    deleteDocument,
    refreshDocuments: loadDocuments
  };
}