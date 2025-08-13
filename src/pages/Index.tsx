import { Link, useNavigate } from 'react-router-dom';
import { FileText, PenTool, Palette, Code, Image, Calculator, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { documentStore } from '@/lib/document-store';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleStartWriting = async () => {
    const newDoc = await documentStore.createDocument();
    if (newDoc) {
      navigate(`/editor/${newDoc.id}`);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out."
      });
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: PenTool,
      title: 'Rich Text Editing',
      description: 'Write with powerful formatting options including bold, italic, headings, and lists'
    },
    {
      icon: Palette,
      title: 'Color Highlights',
      description: 'Highlight important text with multiple colors for better organization'
    },
    {
      icon: Code,
      title: 'Code Blocks',
      description: 'Add syntax-highlighted code blocks for technical documentation'
    },
    {
      icon: Image,
      title: 'Images & Media',
      description: 'Embed images and media directly into your documents'
    },
    {
      icon: Calculator,
      title: 'Math Equations',
      description: 'Write mathematical expressions with LaTeX support'
    },
    {
      icon: FileText,
      title: 'Citations',
      description: 'Add and manage citations for academic and professional writing'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="flex justify-end p-4">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              Write. Create. Collaborate.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A powerful, Notion-like editor for all your writing needs. From simple notes to complex documents 
              with equations, code, and rich formatting.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/documents">
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  My Documents
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={handleStartWriting}>
                <PenTool className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to write</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make your writing experience seamless
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start writing?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of writers who trust our platform for their documentation needs
          </p>
          <Link to="/documents">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-6">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
