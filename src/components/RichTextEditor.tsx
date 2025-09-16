import '../App.css';
import 'katex/dist/katex.min.css';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import { createLowlight, all } from 'lowlight';
import TextAlign from '@tiptap/extension-text-align';
import { ImageAlign } from '../extensions/ImageAlign';
import { ResizableImage } from '../extensions/ResizableImage';

const lowlight = createLowlight(all);
import { useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Highlighter, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Sigma,
  ImagePlus,
  SquareCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2 as LinkIcon,
  Underline as UnderlineIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { MathBlock } from '../extensions/MathBlock';
import { InlineMath } from '../extensions/InlineMath';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');


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
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsSafari(/safari/.test(userAgent) && !/chrome/.test(userAgent));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'resizable-image'],
      }),
      Link.configure({
        openOnClick: false, // We're handling clicks manually
        autolink: true,
        linkOnPaste: true,
      }),
      BulletList,
      OrderedList,
      Highlight.configure({ multicolor: true }),
      ResizableImage,
      ImageAlign,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      MathBlock,
      InlineMath,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            id: {
              default: null,
              renderHTML: attributes => {
                if (attributes.id) {
                  return { id: attributes.id };
                }
                return {};
              },
              parseHTML: element => element.getAttribute('id'),
            },
          };
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const transaction = editor.state.tr;
      let modified = false;
      const newHeadings: { id: string; text: string; level: number }[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading' && (node.attrs.level === 1 || node.attrs.level === 2)) {
          const id = slugify(node.textContent);
          if (id) {
            newHeadings.push({
              id,
              text: node.textContent,
              level: node.attrs.level,
            });
            if (node.attrs.id !== id) {
              transaction.setNodeMarkup(pos, undefined, { ...node.attrs, id });
              modified = true;
            }
          }
        }
      });

      if (modified) {
        editor.view.dispatch(transaction);
      }

      setHeadings(newHeadings);
      onChange(JSON.stringify(editor.getJSON()));
    },
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== content) {
      try {
        // Defer setContent to avoid flushSync warning
        setTimeout(() => {
          editor.commands.setContent(JSON.parse(content));
        }, 0);
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

      editor.on('selectionUpdate', () => {
        if (editor.isActive('link')) {
          setLinkUrl(editor.getAttributes('link').href);
        } else {
          setLinkUrl('');
        }
      });
    }
  }, [readOnly, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setIsLinkMenuOpen(false);
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  const addEquation = () => {
    if (equationInput && editor) {
      editor.chain().focus().setMathBlock(equationInput).run();
      setEquationInput('');
    }
  };

  const addCodeBlock = () => {
    editor.chain().focus().setCodeBlock({ language: codeLanguage }).run();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    }
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
      <div
        className={`bg-editor-bg ${className}`}
        onClick={async (event) => {
          const linkElement = (event.target as HTMLElement).closest('a');
          if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
              if (href.startsWith('#')) {
                event.preventDefault();
                const id = href.substring(1);
                const element = document.getElementById(id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              } else if (href.startsWith('http')) {
                event.preventDefault();
                const module = '@tauri-apps/api/shell';
                const { open } = await import(/* @vite-ignore */ module);
                open(href);
              }
            }
          } else if (event.target === event.currentTarget) {
            editor.chain().focus().setTextSelection(editor.state.doc.content.size).run();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div 
      className={`bg-editor-bg ${className}`}
      onClick={async (event) => {
        const linkElement = (event.target as HTMLElement).closest('a');
        if (linkElement) {
          const href = linkElement.getAttribute('href');
          if (href) {
            if (href.startsWith('#')) {
              event.preventDefault();
              event.stopPropagation();
              const id = href.substring(1);
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else if (href.startsWith('http')) {
              event.preventDefault();
              event.stopPropagation();
              const module = '@tauri-apps/api/shell';
              const { open } = await import(/* @vite-ignore */ module);
              open(href);
            }
          }
        }
      }}
    >
      <div className="border-b bg-background shadow-sm backdrop-blur-sm fixed top-14 left-0 right-0 z-10 pt-[40px]">
        <div className="flex items-center gap-1 p-2 flex-wrap max-w-screen-lg mx-auto justify-center">
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
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          
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
            <DropdownMenuContent className='p-[5px] border rounded-[10px]'>
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

          <DropdownMenu open={isLinkMenuOpen} onOpenChange={setIsLinkMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Toggle size="sm" className="h-8 w-8">
                <LinkIcon className="h-4 w-4" />
              </Toggle>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[350px] p-[5px] border rounded-[10px]" align="start">
              <Tabs defaultValue="external" className="w-full">
                <TabsList className="pt-[12px] grid w-full grid-cols-2 mb-[15px]">
                  <TabsTrigger value="external" className='data-[state=active]:bg-[#F4F4F4] rounded-[10px] ml-[6px] p-[8px]'>External Link</TabsTrigger>
                  <TabsTrigger value="internal" className='data-[state=active]:bg-[#F4F4F4] rounded-[10px] mr-[6px] p-[8px]'>Internal Link</TabsTrigger>
                </TabsList>
                <TabsContent value="external" className="p-3">
                  <div className="bg-white p-[2px] border border-[#374151] rounded-[10px] mb-[5px]">
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setLink()}
                    />
                  </div>
                  <Button onClick={setLink} size="sm" className="w-full bg-[#018786] p-[20px] rounded-[10px] text-white center mt-2 hover:bg-[#52a5a5]">
                    Insert Link
                  </Button>
                </TabsContent>
                <TabsContent value="internal" className="p-3">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No headings found.</CommandEmpty>
                      <CommandGroup>
                        {headings.map((heading) => (
                          <CommandItem
                            key={heading.id}
                            value={heading.text}
                                                        onSelect={() => {
                              editor.chain().focus().extendMarkRange('link').setLink({ href: `#${heading.id}` }).run();
                              setIsLinkMenuOpen(false);
                            }}
                            className="flex gap-2 w-full"
                          >
                            <span className={heading.level === 2 ? 'p-[10px] bg-[#F4F4F4] w-full rounded-[10px] hover:bg-[#FFFFFF]' : 'p-[10px] font-bold text-[17px] bg-[#F4F4F4] w-full rounded-[10px] hover:bg-[#FFFFFF]'}>{heading.text}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </TabsContent>
              </Tabs>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

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

          <ToolbarButton
            onClick={() => {
              const { selection } = editor.state;
              console.log('Align Left clicked. editor.state.selection:', selection);
              if (selection.node && selection.node.type.name === 'resizable-image') {
                editor.chain().focus().setImageAlign('left').run();
              } else {
                editor.chain().focus().setTextAlign('left').run();
              }
            }}
            isActive={editor.isActive({ textAlign: 'left' }) || (editor.state.selection.node && editor.state.selection.node.type.name === 'resizable-image' && editor.state.selection.node.attrs.textAlign === 'left')}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const { selection } = editor.state;
              console.log('Align Center clicked. editor.state.selection:', selection);
              if (selection.node && selection.node.type.name === 'resizable-image') {
                editor.chain().focus().setImageAlign('center').run();
              }
              else {
                editor.chain().focus().setTextAlign('center').run();
              }
            }}
            isActive={editor.isActive({ textAlign: 'center' }) || (editor.state.selection.node && editor.state.selection.node.type.name === 'resizable-image' && editor.state.selection.node.attrs.textAlign === 'center')}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => {
              const { selection } = editor.state;
              console.log('Align Right clicked. editor.state.selection:', selection);
              if (selection.node && selection.node.type.name === 'resizable-image') {
                editor.chain().focus().setImageAlign('right').run();
              }
              else {
                editor.chain().focus().setTextAlign('right').run();
              }
            }}
            isActive={editor.isActive({ textAlign: 'right' }) || (editor.state.selection.node && editor.state.selection.node.type.name === 'resizable-image' && editor.state.selection.node.attrs.textAlign === 'right')}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            disabled={isSafari}
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8">
                <SquareCode className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px] p-[5px] border rounded-[10px]">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8">
                <Sigma className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-[5px] border rounded-[10px]">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Equation</div>
                <div className="bg-white p-[2px] border border-[#374151] rounded-[10px] mb-[5px]">
                  <Input
                    placeholder="eg: \sum_{i=1}^N"
                    value={equationInput}
                    onChange={(e) => setEquationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addEquation();
                      }
                    }}
                    className="border-input bg-transparent focus:ring-0 red"
                  />
                </div>
                  <Button onClick={addEquation} size="sm" className="w-full bg-[#018786] p-[20px] rounded-[10px] text-white center hover:bg-[#52a5a5] mt-2">
                    Insert Equation
                  </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8">
                <ImagePlus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-[5px] border rounded-[10px]">
              <div className="p-3">
                <div className="mb-2 text-sm font-medium">Insert Image</div>
                <div className="bg-white p-[2px] border border-[#374151] rounded-[10px] mb-[5px]">
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
                  <div className="text-center text-xs text-gray-500 my-1">or</div>
                  <Button onClick={() => document.getElementById('fileInput')?.click()} size="sm" className="w-full bg-[#018786] p-[20px] rounded-[10px] text-white center hover:bg-[#52a5a5]">
                    From your computer
                  </Button>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          

          

          <Separator orientation="vertical" className="h-6" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      <div
        className="min-h-[5000px]"
        id="printable-area"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            editor.chain().focus().setTextSelection(editor.state.doc.content.size).run();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
