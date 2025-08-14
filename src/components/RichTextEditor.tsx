import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Mathematics from '@tiptap/extension-mathematics';
import TextAlign from '@tiptap/extension-text-align';
import { createLowlight, all } from 'lowlight';
import { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Highlighter, 
  Strikethrough,
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Palette,
  Type,
  Calculator,
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

const highlightColors = [
  { name: 'Red', value: '#f5545fff', class: 'bg-notion-red' },
  { name: 'Orange', value: '#FF981F', class: 'bg-notion-orange' },
  { name: 'Yellow', value: '#FFEA29', class: 'bg-notion-yellow' },
  { name: 'Green', value: '#83EB4A', class: 'bg-notion-green' },
  { name: 'Blue', value: '#60DDFD', class: 'bg-notion-blue' },
  { name: 'Purple', value: '#C263FA', class: 'bg-notion-purple' },
  { name: 'Pink', value: '#FAA0E2', class: 'bg-notion-pink' },
  { name: 'Gray', value: '#B2B2B2', class: 'bg-notion-gray' },
];

const RichTextEditor = ({ content, onChange, readOnly = false, className = '' }: RichTextEditorProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [equationInput, setEquationInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'heading-style',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          style: 'padding: 0 2px; border-radius: 3px;'
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(all),
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm border-l-4 border-primary',
        },
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
    ],
    content: content ? (() => {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.warn('Failed to parse content JSON:', e);
        return undefined;
      }
    })() : undefined,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none p-6',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent = JSON.parse(content);
        if (JSON.stringify(editor.getJSON()) !== content) {
          editor.commands.setContent(parsedContent);
        }
      } catch (e) {
        console.warn('Failed to update editor content:', e);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  const addEquation = () => {
    if (equationInput) {
      editor.chain().focus().insertContent(`$$${equationInput}$$`).run();
      setEquationInput('');
    }
  };

  const addCodeBlock = () => {
    editor.chain().focus().setCodeBlock({ language: codeLanguage }).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean; 
    children: React.ReactNode;
  }) => (
    <Toggle
      pressed={isActive}
      onPressedChange={onClick}
      disabled={disabled}
      size="sm"
      className="h-8 w-8"
    >
      {children}
    </Toggle>
  );

  if (readOnly) {
    return (
      <div className={`bg-editor-bg ${className}`}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={`bg-editor-bg ${className}`}>
      {/* Toolbar */}
      <div className="border-b bg-background/90 backdrop-blur-sm fixed top-14 left-0 right-0 z-10">
        <div className="flex items-center gap-1 p-2 flex-wrap max-w-screen-lg mx-auto">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          
          {/* Highlight with colors */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Toggle
                pressed={editor.isActive('highlight')}
                size="sm"
                className="h-8 w-8"
              >
                <Highlighter className="h-4 w-4" />
              </Toggle>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {highlightColors.map((color) => (
                <DropdownMenuItem
                  key={color.value}
                  onClick={() => setHighlight(color.value)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className={`w-4 h-4 rounded`}
                    style={{backgroundColor: color.value}}
                  />
                  {color.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Remove highlight
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6" />

          {/* Code Block */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <FileCode className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Code Block</div>
                <div className="space-y-2">
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="bash">Bash</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addCodeBlock} size="sm" className="w-full">
                    Insert Code Block
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Equation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Calculator className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Equation</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="LaTeX equation (e.g., E = mc^2)"
                    value={equationInput}
                    onChange={(e) => setEquationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEquation()}
                  />
                  <Button onClick={addEquation} size="sm">
                    Add
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Examples: x^2, \frac&#123;1&#125;&#123;2&#125;, \sum_&#123;n=1&#125;^&#123;\infty&#125;, \alpha + \beta
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Image */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <div className="p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addImage()}
                  />
                  <Button onClick={addImage} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;