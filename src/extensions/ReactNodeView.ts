import { NodeView } from '@tiptap/core';
import { EditorView } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import React from 'react';
import { createRoot } from 'react-dom/client';

export class ReactNodeView extends NodeView {
  editor: any;
  node: Node;
  getPos: () => number;
  extension: any;
  view: EditorView;
  dom: HTMLElement;
  contentDOM: HTMLElement | null;
  reactRenderer: any;
  component: React.ComponentType<any>;

  constructor(component: React.ComponentType<any>, { editor, node, getPos, extension, view }: any) {
    super(node, view, getPos, editor);
    this.component = component;
    this.editor = editor;
    this.node = node;
    this.getPos = getPos;
    this.extension = extension;
    this.view = view;

    this.dom = document.createElement(node.isInline ? 'span' : 'div');
    this.dom.classList.add('react-node-view');
    if (node.isBlock) {
      this.dom.style.display = 'block';
    }

    this.reactRenderer = createRoot(this.dom);
    this.renderReactComponent();
  }

  renderReactComponent() {
    const Component = this.component;
    this.reactRenderer.render(
      React.createElement(Component, {
        editor: this.editor,
        node: this.node,
        getPos: this.getPos,
        selected: this.editor.isActive(this.node.type.name),
        updateAttributes: (attrs: Record<string, any>) => this.updateAttributes(attrs),
        extension: this.extension,
        view: this.view,
      })
    );
  }

  update(node: Node, decorations: any): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    // Update the node reference
    this.node = node;
    this.renderReactComponent();

    // Always return true to prevent Tiptap from re-rendering the DOM node
    // This ensures React controls the DOM updates
    return true;
  }

  destroy() {
    this.reactRenderer.unmount();
    this.dom.remove();
  }

  updateAttributes(attrs: Record<string, any>) {
    this.editor.view.dispatch(
      this.editor.view.state.tr.setNodeMarkup(this.getPos(), undefined, { ...this.node.attrs, ...attrs })
    );
  }
}