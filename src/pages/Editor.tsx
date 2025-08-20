import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useDocument } from '@/hooks/use-document';
import RichTextEditor from '@/components/RichTextEditor';

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, loading, saving, updateDocument, deleteDocument } = useDocument(id);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Refs per gestire il debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastContentRef = useRef('');

  // Aggiorna il contenuto locale solo se l'utente non sta scrivendo
  useEffect(() => {
    if (document && !isTypingRef.current) {
      setTitle(document.title || '');
      setContent(document.content || '');
      lastContentRef.current = document.content || '';
    }
  }, [document]);

  useEffect(() => {
    if (!loading && !document && id) {
      toast({
        title: "Document not found",
        description: "The document you're looking for doesn't exist.",
        variant: "destructive"
      });
    }
  }, [loading, document, id]);

  // Cleanup del timeout quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Funzione di salvataggio con debounce
  const debouncedSave = useCallback(async (newContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateDocument({ content: newContent });
        lastContentRef.current = newContent;
        isTypingRef.current = false;
      } catch (error) {
        console.error('Error saving content:', error);
      }
    }, 1500); // Salva dopo 1 secondo di inattività
  }, [updateDocument]);

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    await updateDocument({ title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    isTypingRef.current = true;
    setContent(newContent);
    debouncedSave(newContent);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() === '') {
      setTitle(document?.title || 'Untitled');
    } else {
      handleTitleChange(title);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Document link has been copied to clipboard."
    });
  };

  const handleDelete = async () => {
    if (document && window.confirm('Are you sure you want to delete this document?')) {
      const success = await deleteDocument();
      if (success) {
        navigate('/documents');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading document...</h2>
          <p className="text-muted-foreground">Please wait while we load your document.</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground">The document you're looking for doesn't exist.</p>
          <Link to="/documents" className="mt-4 inline-block">
            <Button>Back to Documents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="border-b bg-background/100 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-6 pb-3 pt-[42px]">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/documents">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            
            {/* Title - Google Docs style */}
            <div className="flex-1 max-w-md">
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="border-2 border-[#374151] shadow-none px-[15px] py-[6px] h-auto bg-transparent rounded-full"
                  style={{ fontSize: '1.125rem', color: '#374151' }}
                  autoFocus
                />
              ) : (
                <h1 
                  className="text-lg font-medium text-foreground cursor-text hover:bg-hover px-[20px] py-1 rounded transition-colors truncate"
                  onClick={() => setIsEditingTitle(true)}
                  title={title}
                >
                  {title}
                </h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Read-only button */}
            <Button
              size="sm"
              onClick={() => setIsReadOnly(!isReadOnly)}
              className="bg-[#018786] text-white hover:bg-[#52a5a5] p-[21px] rounded-full"
            >
              {isReadOnly ? 'Read-only mode' : saving ? 'Saving' : 'Editing mode'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-[15px] border rounded-[10px]">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  Rename document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="bg-[#c00144] hover:bg-red-700 p-[10px] rounded-[10px] text-white center"
>
                  Delete document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex justify-center pt-[160px]">
        <div className="max-w-4xl w-full">
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            readOnly={isReadOnly}
            className="min-h-screen"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;