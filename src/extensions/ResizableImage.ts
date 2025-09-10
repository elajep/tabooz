
import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageView } from './ResizableImageView';

export const ResizableImage = Image.extend({
  name: 'resizable-image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      textAlign: {
        default: 'center',
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
