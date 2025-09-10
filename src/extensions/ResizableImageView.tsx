import React, { useRef, useCallback, useEffect, useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export const ResizableImageView = ({ node, updateAttributes, editor }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const handleSelectionUpdate = () => {
      const isSelected = editor.isActive('resizable-image');
      console.log('Image selected:', isSelected);
      setSelected(isSelected);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    handleSelectionUpdate();

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      console.log('handleMouseDown triggered');
      if (!containerRef.current || !selected) {
        console.log('handleMouseDown: not selected or no containerRef');
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const img = containerRef.current.querySelector('img');
      if (!img) {
        console.log('handleMouseDown: no img element found');
        return;
      }

      const rect = img.getBoundingClientRect();
      console.log('Image rect:', rect);

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;

      let resizeDirection = '';
      const tolerance = 10; // pixels from edge to detect resize

      if (event.clientX < rect.left + tolerance) resizeDirection += 'left';
      else if (event.clientX > rect.right - tolerance) resizeDirection += 'right';

      if (event.clientY < rect.top + tolerance) resizeDirection += 'top';
      else if (event.clientY > rect.bottom - tolerance) resizeDirection += 'bottom';

      if (!resizeDirection) {
        console.log('handleMouseDown: not on resizable edge');
        return; // Not on a resizable edge
      }

      console.log('Starting resize in direction:', resizeDirection);
      setIsResizing(true);

      const handleMouseMove = (e: MouseEvent) => {
        const aspectRatio = startWidth / startHeight; // Calculate aspect ratio once

        let calculatedWidth = startWidth;
        let calculatedHeight = startHeight;

        // Get the maximum available width from the parent container
        const maxAvailableWidth = containerRef.current.parentElement.offsetWidth;

        if (resizeDirection.includes('right')) {
          calculatedWidth = startWidth + (e.clientX - startX);
        } else if (resizeDirection.includes('left')) {
          calculatedWidth = startWidth - (e.clientX - startX);
        }

        if (resizeDirection.includes('bottom')) {
          calculatedHeight = startHeight + (e.clientY - startY);
        } else if (resizeDirection.includes('top')) {
          calculatedHeight = startHeight - (e.clientY - startY);
        }

        // Now, apply aspect ratio to get a consistent pair of width/height
        // Prioritize width if resizing horizontally, height if resizing vertically
        if (resizeDirection.includes('left') || resizeDirection.includes('right')) {
          calculatedHeight = calculatedWidth / aspectRatio;
        } else if (resizeDirection.includes('top') || resizeDirection.includes('bottom')) {
          calculatedWidth = calculatedHeight * aspectRatio;
        }

        // Apply minimum size constraints
        const minWidth = 50; // Minimum width for the image
        const minHeight = 50; // Minimum height for the image

        if (calculatedWidth < minWidth) {
          calculatedWidth = minWidth;
          calculatedHeight = minWidth / aspectRatio;
        }
        if (calculatedHeight < minHeight) {
          calculatedHeight = minHeight;
          calculatedWidth = minHeight * aspectRatio;
        }

        // Apply maximum width constraint
        if (calculatedWidth > maxAvailableWidth) {
          calculatedWidth = maxAvailableWidth;
          calculatedHeight = maxAvailableWidth / aspectRatio; // Recalculate height based on capped width
        }

        console.log('Resizing: newWidth=', calculatedWidth, 'newHeight=', calculatedHeight);
        updateAttributes({ width: `${calculatedWidth}px`, height: `${calculatedHeight}px` });
      };

      const handleMouseUp = () => {
        console.log('Resize ended');
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [selected, updateAttributes]
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || isResizing || !selected) return;

    const img = containerRef.current.querySelector('img');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const tolerance = 10; // pixels from edge to detect resize

    let cursor = 'default';

    const onLeftEdge = event.clientX < rect.left + tolerance;
    const onRightEdge = event.clientX > rect.right - tolerance;
    const onTopEdge = event.clientY < rect.top + tolerance;
    const onBottomEdge = event.clientY > rect.bottom - tolerance;

    if (onLeftEdge && onTopEdge) cursor = 'nwse-resize';
    else if (onRightEdge && onTopEdge) cursor = 'nesw-resize';
    else if (onLeftEdge && onBottomEdge) cursor = 'nesw-resize';
    else if (onRightEdge && onBottomEdge) cursor = 'nwse-resize';
    else if (onLeftEdge || onRightEdge) cursor = 'ew-resize';
    else if (onTopEdge || onBottomEdge) cursor = 'ns-resize';

    if (containerRef.current) {
      containerRef.current.style.cursor = cursor;
    }
  }, [isResizing, selected]);

  const width = node.attrs.width;
  const height = node.attrs.height;
  const textAlign = node.attrs.textAlign;

  const wrapperStyle = {
    width,
    height,
    position: 'relative',
    display: 'block',
    maxWidth: '100%',
    ...(textAlign === 'left' && { marginLeft: '0', marginRight: 'auto' }),
    ...(textAlign === 'center' && { marginLeft: 'auto', marginRight: 'auto' }),
    ...(textAlign === 'right' && { marginLeft: 'auto', marginRight: '0' }),
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`resizable-image-container ${selected ? 'selected' : ''}`}
      style={wrapperStyle}
      data-drag-handle
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (containerRef.current) containerRef.current.style.cursor = 'default'; }}
    >
      <img src={node.attrs.src} alt={node.attrs.alt} style={{ borderRadius: '8px', display: 'block', width: '100%', height: '100%' }} />
    </NodeViewWrapper>
  );
};