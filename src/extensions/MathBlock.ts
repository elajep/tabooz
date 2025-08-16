import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathBlockView } from './MathBlockView';
import katex from 'katex';

export interface MathBlockOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (latex: string) => ReturnType,
      updateMathBlock: (pos: number, latex: string) => ReturnType,
      setMathBlockAlignment: (pos: number, align: string) => ReturnType,
    }
  }
}

export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',
  
  group: 'block',
  
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
      textAlign: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-text-align'),
        renderHTML: attributes => ({
          'data-text-align': attributes.textAlign,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'math-block' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView)
  },

  addCommands() {
    return {
      setMathBlock: latex => ({ chain }) => {
        return chain()
          .insertContent({ type: this.name, attrs: { latex, textAlign: 'left' } })
          .insertContent({ type: 'paragraph' })
          .run()
      },
      updateMathBlock: (pos, latex) => ({ tr }) => {
        const node = tr.doc.nodeAt(pos)
        return tr.setNodeMarkup(pos, undefined, { 
          ...node?.attrs,
          latex 
        })
      },
      setMathBlockAlignment: (pos, align) => ({ tr }) => {
        const node = tr.doc.nodeAt(pos)
        return tr.setNodeMarkup(pos, undefined, { 
          ...node?.attrs,
          textAlign: align 
        })
      },
    }
  },
})
