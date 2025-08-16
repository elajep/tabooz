const API_URL = 'http://localhost:3001/api';

// This type should match the one in use-documents.ts if it exists
export interface Document {
  id: string;
  title: string;
  created_at: string;
  content?: any; // Content is optional in list view
}

export const documentStore = {
  async getAllDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${API_URL}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      return null;
    }
  },

  async createDocument(title?: string): Promise<{ id: string } | null> {
    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error('Failed to create document');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  },

  async updateDocument(id: string, data: { title?: string, content?: any }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      return true;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      return false;
    }
  },

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      return false;
    }
  },
};