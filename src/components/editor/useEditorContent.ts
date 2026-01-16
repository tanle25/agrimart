/**
'use client';
 * Hook để lấy nội dung editor từ bên ngoài component
 * Sử dụng khi Editor được tích hợp vào các trang khác
 */

import { useRef, useCallback } from 'react';

export interface EditorContentAPI {
  getHTML: () => string | null;
  getJSON: () => any | null;
  getText: () => string | null;
  getContent: () => { html: string; json: any; text: string } | null;
  setContent: (html: string) => void;
  setContentFromJSON: (json: any) => void;
  clear: () => void;
  focus: () => void;
  blur: () => void;
}

/**
 * Hook để tạo ref và API để tương tác với Editor từ bên ngoài
 */
export function useEditorContent() {
  const editorRef = useRef<any>(null);

  const getHTML = useCallback(() => {
    return editorRef.current?.getHTML() || null;
  }, []);

  const getJSON = useCallback(() => {
    return editorRef.current?.getJSON() || null;
  }, []);

  const getText = useCallback(() => {
    return editorRef.current?.getText() || null;
  }, []);

  const getContent = useCallback(() => {
    if (!editorRef.current) return null;
    return {
      html: editorRef.current.getHTML(),
      json: editorRef.current.getJSON(),
      text: editorRef.current.getText(),
    };
  }, []);

  const setContent = useCallback((html: string) => {
    editorRef.current?.commands.setContent(html);
  }, []);

  const setContentFromJSON = useCallback((json: any) => {
    editorRef.current?.commands.setContent(json);
  }, []);

  const clear = useCallback(() => {
    editorRef.current?.commands.clearContent();
  }, []);

  const focus = useCallback(() => {
    editorRef.current?.commands.focus();
  }, []);

  const blur = useCallback(() => {
    editorRef.current?.commands.blur();
  }, []);

  const api: EditorContentAPI = {
    getHTML,
    getJSON,
    getText,
    getContent,
    setContent,
    setContentFromJSON,
    clear,
    focus,
    blur,
  };

  return {
    editorRef,
    editorAPI: api,
  };
}

