import { Node, mergeAttributes } from '@tiptap/core';

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

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'math-equation',
      }),
      `$${HTMLAttributes.equation}$`,
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