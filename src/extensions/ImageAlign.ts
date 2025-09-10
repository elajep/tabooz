import { Extension } from '@tiptap/core';

export const ImageAlign = Extension.create({
  name: 'imageAlign',

  addOptions() {
    return {
      types: ['resizable-image'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: 'center',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: element => element.style.textAlign || this.options.defaultAlignment,
            renderHTML: attributes => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return { style: `text-align: ${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setImageAlign: (alignment: string) => ({ commands }) => {
        if (!this.options.alignments.includes(alignment)) {
          return false;
        }
        return commands.updateAttributes(this.options.types[0], { textAlign: alignment });
      },
    };
  },
});
