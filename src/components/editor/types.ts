import React from 'react';
import { Editor } from '@tiptap/react';

export interface EditorProps {
  editor: Editor | null;
}

export interface IconProps {
  className?: string;
  size?: number;
}

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface MenuButton {
  icon: React.ElementType;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}