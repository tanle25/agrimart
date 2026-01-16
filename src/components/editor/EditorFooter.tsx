'use client';
import React from 'react';
import { EditorProps } from './types';

export const EditorFooter: React.FC<EditorProps> = ({ editor }) => {
  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-1.5 flex justify-between items-center text-xs text-gray-500 z-50 print:hidden">
      <div className="flex gap-4">
        <span>{wordCount} words</span>
        <span>{characterCount} characters</span>
      </div>
      <div>
        Last saved: Just now
      </div>
    </div>
  );
};