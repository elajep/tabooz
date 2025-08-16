import { Node, mergeAttributes } from '@tiptap/core';
import { MathBlockView } from './MathBlockView';
import { ReactNodeView } from './ReactNodeView';

// Regex to match inline math format $...$
const INLINE_MATH_REGEX = /\\$([^\\$]+)\\$/;

export const MathBlock = Node.create({
  name: 'math-block',
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
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' }), 0]
  },

  addNodeView() {
    return (props) => new ReactNodeView(MathBlockView, props);
  },

  addCommands() {
    return {
      setMathBlock: latex => ({ chain }) => {
        return chain()
          .insertContent({ type: this.name, attrs: { latex, textAlign: 'left' } })
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