import katex from 'katex';
import { useEffect, useRef, useState } from 'react';

export const MathBlockView = ({ node, updateAttributes, editor }: any) => {
  const [isEditing, setIsEditing] = useState(node.attrs.latex === '');
  
  const [latexValue, setLatexValue] = useState(node.attrs.latex);
  const mathRef = useRef<HTMLDivElement>(null);

  const textAlignClass = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify',
  }[node.attrs.textAlign || 'left'];

  useEffect(() => {
    if (!isEditing && mathRef.current) {
      try {
        katex.render(node.attrs.latex, mathRef.current, {
          displayMode: true,
          throwOnError: false,
        });
        
      } catch (error) {
        console.error('KaTeX rendering error in MathBlockView:', error);
        if (mathRef.current) {
          mathRef.current.innerHTML = (error as Error).message;
        }
      }
    }
  }, [isEditing, node.attrs.latex]);

  const handleOnBlur = () => {
    if (editor.isEditable) {
      updateAttributes({ latex: latexValue });
      setIsEditing(false);
    }
  };

  if (isEditing && editor.isEditable) {
    
    return (
      <div className={`math-block-editor my-4 p-2 border border-primary rounded-md ${textAlignClass}`}>
        <textarea
          value={latexValue}
          onChange={(e) => setLatexValue(e.target.value)}
          onBlur={handleOnBlur}
          autoFocus
          className="w-full bg-transparent focus:outline-none font-mono text-sm"
          rows={3}
        />
        <div className="text-xs text-muted-foreground mt-1">
          Editing LaTeX. Click outside to save.
        </div>
      </div>
    );
  }

  
  return (
    <div
      className={`math-block my-0 cursor-pointer hover:bg-muted/40 rounded-md px-3 py-2`}
      style={{ textAlign: node.attrs.textAlign || 'left' }}
      onClick={() => {
        if (editor.isEditable) {
          setIsEditing(true);
        }
      }}
    >
      <div ref={mathRef} className={`math-block-wrapper ${!node.attrs.latex ? 'empty-math' : ''}`} />
      {!node.attrs.latex && (
        <p className="text-muted-foreground">Click to edit equation</p>
      )}
    </div>
  );
};