import { Node, mergeAttributes } from '@tiptap/core';
import katex from 'katex';

export interface EquationOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    equation: {
      setEquation: (options: { equation: string }) => ReturnType;
    };
  }
}

export const Equation = Node.create<EquationOptions>({
  name: 'equation',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,

  group: 'inline',

  addAttributes() {
    return {
      equation: {
        default: '',
        parseHTML: element => element.getAttribute('data-equation'),
        renderHTML: attributes => {
          if (!attributes.equation) {
            return {};
          }
          return {
            'data-equation': attributes.equation,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-equation]',
      },
    ];
  },

  renderHTML({ node }) {
    const equation = node.attrs.equation || '';
    let renderedEquation = '';
    
    try {
      renderedEquation = katex.renderToString(equation, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (error) {
      renderedEquation = `$${equation}$`;
    }

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, {
        class: 'math-equation',
        'data-equation': equation,
      }),
      ['span', { innerHTML: renderedEquation }],
    ];
  },

  addCommands() {
    return {
      setEquation:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});