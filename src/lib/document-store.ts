import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentInsert {
  title?: string;
  content?: string;
}

export interface DocumentUpdate {
  title?: string;
  content?: string;
}

class DocumentStore {
  async getAllDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch document:', error);
      return null;
    }
  }

  async createDocument(title: string = 'Untitled'): Promise<Document | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await (supabase as any)
        .from('documents')
        .insert({
          title,
          user_id: user.id,
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: []
              }
            ]
          })
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create document:', error);
      return null;
    }
  }

  async updateDocument(id: string, updates: DocumentUpdate): Promise<Document | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update document:', error);
      return null;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }
}

export const documentStore = new DocumentStore();