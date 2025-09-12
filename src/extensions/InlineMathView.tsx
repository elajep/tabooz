import katex from 'katex';
import { useEffect, useRef } from 'react';

export const InlineMathView = ({ node, editor }: any) => {
  console.log('InlineMathView rendering. latex:', node.attrs.latex);
  const mathRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (mathRef.current) {
      try {
        katex.render(node.attrs.latex, mathRef.current, {
          displayMode: false, // Important for inline rendering
          throwOnError: false,
        });
        console.log('KaTeX rendered successfully in InlineMathView');
      } catch (error) {
        console.error('KaTeX rendering error in InlineMathView:', error);
        if (mathRef.current) {
          mathRef.current.textContent = (error as Error).message;
        }
      }
    }
  }, [node.attrs.latex]);

  return (
    <span className="inline-math"
      style={{ display: editor.isEditable ? 'inline-block' : 'inline-block !important' }}
    >
      <span ref={mathRef} />
    </span>
  );
};