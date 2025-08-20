import 'katex/dist/katex.min.css';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextAlign from '@tiptap/extension-text-align';
import { createLowlight, all } from 'lowlight';


const lowlight = createLowlight(all);
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
import { MathBlock } from '../extensions/MathBlock';
import { InlineMath } from '../extensions/InlineMath';


interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

const highlightColors = [
  { name: 'Red', value: '#f5545fCC', class: 'bg-notion-red' },
  { name: 'Orange', value: '#FF981FCC', class: 'bg-notion-orange' },
  { name: 'Yellow', value: '#FFEA29CC', class: 'bg-notion-yellow' },
  { name: 'Green', value: '#83EB4ACC', class: 'bg-notion-green' },
  { name: 'Blue', value: '#60DDFDCC', class: 'bg-notion-blue' },
  { name: 'Purple', value: '#C263FACC', class: 'bg-notion-purple' },
  { name: 'Pink', value: '#FAA0E2CC', class: 'bg-notion-pink' },
  { name: 'Gray', value: '#B2B2B2CC', class: 'bg-notion-gray' },
];

const RichTextEditor = ({ content, onChange, readOnly = false, className = '' }: RichTextEditorProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [equationInput, setEquationInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

    const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      OrderedList,
      Highlight.configure({ multicolor: true }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      MathBlock,
      InlineMath,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== content) {
      try {
        const parsedContent = JSON.parse(content);
        editor.commands.setContent(parsedContent, false);
      } catch (e) {
        console.warn('Failed to parse and set content:', e);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editable: !readOnly,
      });
    }
  }, [readOnly, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  // Inserisci equazione come blocco separato
  const addEquation = () => {
    if (equationInput && editor) {
      editor.chain().focus().setMathBlock(equationInput).run();
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
      <div className="border-b bg-background shadow-sm backdrop-blur-sm fixed top-[91px] left-0 right-0 z-10">
        <div className="flex items-center gap-1 p-2 flex-wrap max-w-screen-lg mx-auto justify-center">
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
            <DropdownMenuContent className='p-[15px] border rounded-[10px]'>
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
            <DropdownMenuContent className="w-60 p-[15px] border rounded-[10px]">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Code Block</div>
                <div className="space-y-2">
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="bg-white rounded-[10px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white p-[15px] border rounded-[10px]">
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
                  <Button onClick={addCodeBlock} size="sm" className="w-full bg-[#018786] p-[20px] rounded-[10px] text-white center hover:bg-[#52a5a5]">
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
            <DropdownMenuContent className="w-80 p-2 bg-background border rounded-lg shadow-lg">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Equation</div>
                <div className="flex gap-2 p-2 rounded-md bg-muted/50 border">
                  <Input
                    placeholder="LaTeX equation (e.g., E = mc^2)"
                    value={equationInput}
                    onChange={(e) => setEquationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addEquation();
                      }
                    }}
                    className="border-input bg-transparent focus:ring-0"
                  />
                  <Button onClick={addEquation} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Add
                  </Button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Examples: x^2, \frac{1}{2}
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
            <DropdownMenuContent className="w-[300px] p-[15px] border rounded-[10px]">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Image</div>
                <div className="bg-white p-[5px] border border-[#374151] rounded-[10px]">
                  <Input
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addImage()}
                  />
                </div>
                  <Button onClick={addImage} size="sm" className="w-full bg-[#018786] p-[20px] rounded-[10px] text-white center  mt-2 hover:bg-[#52a5a5]">
                    Insert Image
                  </Button>
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
      <div className="min-h-[200px]" id="printable-area">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;