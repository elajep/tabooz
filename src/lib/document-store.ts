// Simple in-memory document store (in a real app, this would be a database)
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

class DocumentStore {
  private documents: Document[] = [
    {
      id: '1',
      title: 'Welcome to Your Notion-like Editor',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to Your Notion-like Editor' }]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a powerful document editor that supports ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'rich text formatting' },
              { type: 'text', text: ', ' },
              { type: 'text', marks: [{ type: 'highlight', attrs: { color: '#ffeb3b' } }], text: 'highlights' },
              { type: 'text', text: ', equations, citations, and much more!' }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Features' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Rich text editing with formatting options' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Code blocks with syntax highlighting' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Mathematical equations with LaTeX support' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Multiple highlight colors' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Image support' }]
                  }
                ]
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Citation management' }]
                  }
                ]
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Try creating a new document to get started!' }
            ]
          }
        ]
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getAllDocuments(): Document[] {
    return this.documents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getDocument(id: string): Document | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  createDocument(title: string = 'Untitled'): Document {
    const document: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: []
          }
        ]
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.push(document);
    return document;
  }

  updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Document | undefined {
    const document = this.getDocument(id);
    if (!document) return undefined;

    Object.assign(document, updates, { updatedAt: new Date() });
    return document;
  }

  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;
    this.documents.splice(index, 1);
    return true;
  }
}

export const documentStore = new DocumentStore();