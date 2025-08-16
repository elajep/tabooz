import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { InlineMathView } from './InlineMathView';
import { ReactNodeView } from './ReactNodeView';

// Regex to match inline math format $...$
const INLINE_MATH_REGEX = /\$([^$]+)\$/;

export const InlineMath = Node.create({
  name: 'inline-math',
  group: 'inline',
  inline: true,
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
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline-math"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' })];
  },

  addNodeView() {
    return (props) => new ReactNodeView(InlineMathView, props);
  },

  addInputRules() {
    return [
      new InputRule({
        find: INLINE_MATH_REGEX,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const latex = match[1];

          tr.replaceWith(range.from, range.to, this.type.create({ latex }));
        },
      }),
    ];
  },
});
