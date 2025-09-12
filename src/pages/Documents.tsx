import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useDocuments } from '@/hooks/use-documents';
import { getPlainTextFromTiptapJson } from '@/lib/utils';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { documents, loading, createDocument } = useDocuments();

  const handleCreateDocument = async () => {
    const newDoc = await createDocument();
    if (newDoc) {
      navigate(`/editor/${newDoc.id}`);
    }
  };


  const filteredDocuments = documents.filter(doc =>
    (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen bg-background px-[20px]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-subtle drag-region pt-[30px]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between no-drag">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">My Documents</h1>
              <p className="text-muted-foreground mt-1">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={handleCreateDocument} size="lg" className="shadow-md btn-custom-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
          
          {/* Search */}
          <div className="mt-6 max-w-md border-2 border-[#374151] rounded-full no-drag">
            <div className="relative rounded-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 rounded-full" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-[220px]">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first document to get started'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="relative">
                <Link
                  to={`/editor/${document.id}`}
                  className="block transition-transform hover:scale-105 border-2 h-full"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium truncate" title={document.title}>
                        {document.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex-grow">
                      <p className="text-sm text-gray-500 line-clamp-3">
                        {getPlainTextFromTiptapJson(document.content).substring(0, 150)}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                    </CardFooter>
                  </Card>
                </Link>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;