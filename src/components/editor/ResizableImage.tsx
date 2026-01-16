'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export const ResizableImage = ({ node, updateAttributes, selected, extension }: NodeViewProps) => {
  const [resizing, setResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(node.attrs.width);
  const [caption, setCaption] = useState(node.attrs.caption || '');
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  // Sync width with node attributes
  useEffect(() => {
    setCurrentWidth(node.attrs.width);
  }, [node.attrs.width]);

  // Sync caption with node attributes (for undo/redo)
  useEffect(() => {
    setCaption(node.attrs.caption || '');
  }, [node.attrs.caption]);

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();

    if (!imageRef.current) return;

    // Get current width in pixels (convert % if needed)
    const startWidth = imageRef.current.offsetWidth;
    const startX = e.clientX;

    resizeRef.current = { startX, startWidth };
    setResizing(true);

    const onMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      
      const { startX, startWidth } = resizeRef.current;
      const diff = e.clientX - startX;
      
      // Calculate new width
      const newWidth = direction === 'right' 
        ? startWidth + diff 
        : startWidth - diff;

      // Min width 100px, Max width 1200px
      const clampedWidth = Math.max(100, Math.min(newWidth, 1200));
      
      setCurrentWidth(`${clampedWidth}px`);
    };

    const onMouseUp = () => {
      setResizing(false);
      if (resizeRef.current) {
         // Save final width to Tiptap document
         // We use the current image width style which was updated via state
         updateAttributes({ width: imageRef.current?.style.width });
      }
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [updateAttributes]);

  return (
    <NodeViewWrapper className="group relative flex flex-col items-center justify-center leading-none my-0 select-none" style={{ margin: 0 }}>
      <figure className="relative flex flex-col items-center transition-all duration-100 ease-linear max-w-full" style={{ margin: 0 }}>
        {/* Image Container */}
        <div className="relative inline-block group/image" style={{ width: currentWidth, maxWidth: '100%' }}>
            <img
            ref={imageRef}
            src={node.attrs.src}
            alt={node.attrs.alt}
            title={node.attrs.title}
            style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block'
            }}
            className={`
                block rounded-lg transition-all duration-200
                ${selected ? 'ring-[3px] ring-blue-400 shadow-xl' : 'shadow-sm hover:shadow-md'}
            `}
            />

            {/* Overlay when selected or resizing to indicate interactivity */}
            {(selected || resizing) && (
                <>
                    {/* Resize Handle - Right */}
                    <div
                        className="absolute top-0 right-0 h-full w-4 cursor-col-resize flex items-center justify-center group/handle z-50 hover:bg-blue-500/10 transition-colors"
                        style={{ right: '-8px' }} // Offset to overlap slightly
                        onMouseDown={(e) => handleMouseDown(e, 'right')}
                    >
                        <div className="w-1.5 h-12 bg-white border border-gray-400 rounded-full shadow-sm group-hover/handle:bg-blue-600 group-hover/handle:border-blue-600 transition-colors"></div>
                    </div>

                    {/* Resize Handle - Left */}
                    <div
                        className="absolute top-0 left-0 h-full w-4 cursor-col-resize flex items-center justify-center group/handle z-50 hover:bg-blue-500/10 transition-colors"
                        style={{ left: '-8px' }} // Offset to overlap slightly
                        onMouseDown={(e) => handleMouseDown(e, 'left')}
                    >
                        <div className="w-1.5 h-12 bg-white border border-gray-400 rounded-full shadow-sm group-hover/handle:bg-blue-600 group-hover/handle:border-blue-600 transition-colors"></div>
                    </div>
                    
                    {/* Visual Dimensions Label (Only while resizing) */}
                    {resizing && (
                        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none backdrop-blur-sm font-mono">
                            {parseInt(String(currentWidth), 10)}px
                        </div>
                    )}
                </>
            )}
        </div>
        
        {/* Caption Field */}
        {(selected || caption) && (
            <figcaption className="mt-0 w-full flex justify-center">
                <input
                    type="text"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => {
                        setCaption(e.target.value);
                        updateAttributes({ caption: e.target.value });
                    }}
                    onMouseDown={(e) => e.stopPropagation()} // Prevent Tiptap selection hijacking
                    onKeyDown={(e) => {
                        // Prevent Enter from creating new paragraph
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                    className="w-full text-center text-sm text-gray-500 placeholder:text-gray-300 italic bg-transparent outline-none border-b border-transparent focus:border-gray-200 transition-colors py-1 px-2"
                    style={{ width: currentWidth, maxWidth: '100%' }}
                />
            </figcaption>
        )}
      </figure>
    </NodeViewWrapper>
  );
};