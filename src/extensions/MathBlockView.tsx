import { NodeViewProps } from '@tiptap/react'
import katex from 'katex'
import { useEffect, useRef } from 'react'

export const MathBlockView = ({ node, updateAttributes }: NodeViewProps) => {
  const mathRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mathRef.current) {
      katex.render(node.attrs.latex, mathRef.current, {
        displayMode: true,
        throwOnError: false,
      })
    }
  }, [node.attrs.latex])

  const textAlignClass = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify',
  }[node.attrs.textAlign || 'left']

  return (
    <div 
      className={`math-block my-4 cursor-pointer hover:bg-muted/40 rounded-md px-3 py-2 ${textAlignClass}`}
      data-type="math-block"
      onClick={() => {
        const event = new CustomEvent('math-block-click', {
          detail: { 
            pos: node.pos, 
            latex: node.attrs.latex,
            textAlign: node.attrs.textAlign
          }
        })
        window.dispatchEvent(event)
      }}
    >
      <div ref={mathRef} />
    </div>
  )
}
