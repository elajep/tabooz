import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/hooks/use-documents';
import { useAuth } from '@/components/AuthProvider';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { documents, loading, createDocument } = useDocuments();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleCreateDocument = async () => {
    const newDoc = await createDocument();
    if (newDoc) {
      navigate(`/editor/${newDoc.id}`);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading documents...</h2>
          <p className="text-muted-foreground">Please wait while we load your documents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">My Documents</h1>
              <p className="text-muted-foreground mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={handleCreateDocument} size="lg" className="shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
          
          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first document to get started'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateDocument}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <Link
                key={document.id}
                to={`/editor/${document.id}`}
                className="block transition-transform hover:scale-105"
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium truncate" title={document.title}>
                      {document.title}
                    </CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(document.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-16 text-sm text-muted-foreground line-clamp-3">
                      {/* Simple content preview - in a real app you'd extract text from rich content */}
                      Click to open and edit this document...
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;