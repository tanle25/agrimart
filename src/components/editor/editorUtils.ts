/**
'use client';
 * Editor Utilities
 * Các hàm tiện ích để làm việc với editor content
 */

/**
 * Get editor content in multiple formats
 */
export function getEditorContent(editor: any) {
  if (!editor) {
    return null;
  }

  return {
    html: editor.getHTML(),
    json: editor.getJSON(),
    text: editor.getText(),
  };
}

/**
 * Set editor content from HTML
 */
export function setEditorContentFromHTML(editor: any, html: string) {
  if (!editor) return;
  editor.commands.setContent(html);
}

/**
 * Set editor content from JSON
 */
export function setEditorContentFromJSON(editor: any, json: any) {
  if (!editor) return;
  editor.commands.setContent(json);
}

/**
 * Export editor content for saving to database
 */
export function exportEditorContent(editor: any) {
  if (!editor) {
    return null;
  }

  const content = getEditorContent(editor);
  
  return {
    ...content,
    // Additional metadata
    wordCount: editor.storage.characterCount?.words() || 0,
    characterCount: editor.storage.characterCount?.characters() || 0,
    // Timestamp
    exportedAt: new Date().toISOString(),
  };
}

