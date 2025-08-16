import { useState, useEffect, useCallback } from 'react';
import { documentStore, type Document } from '@/lib/document-store';
import { toast } from '@/hooks/use-toast';

export function useDocument(id: string | undefined) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDocument = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const doc = await documentStore.getDocument(id);
      setDocument(doc);
    } catch (error) {
      toast({
        title: "Error loading document",
        description: "Failed to load the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const updateDocument = async (updates: { title?: string; content?: string }) => {
    if (!document) return false; // Return false on failure

    try {
      setSaving(true);
      const success = await documentStore.updateDocument(document.id, updates);
      if (success) {
        // Optimistically update the local document state
        setDocument(prevDoc => {
          if (!prevDoc) return null;
          return { ...prevDoc, ...updates };
        });
        return true; // Indicate success
      }
    } catch (error) {
      toast({
        title: "Error saving document",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    }
    finally {
      setSaving(false);
    }
    return false; // Indicate failure
  };

  const deleteDocument = async () => {
    if (!document) return false;

    try {
      const success = await documentStore.deleteDocument(document.id);
      if (success) {
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
    document,
    loading,
    saving,
    updateDocument,
    deleteDocument,
    refreshDocument: loadDocument
  };
}