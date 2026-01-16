# Hướng dẫn sử dụng Editor Component

## 1. Drag & Drop Media - Tự động Upload

Editor hỗ trợ kéo thả file media (image, video, audio) và **tự động upload** nếu có cấu hình `uploadUrl`.

### Cách hoạt động:
- Nếu có `VITE_UPLOAD_URL` hoặc `config.uploadUrl`: File sẽ được upload lên server và trả về URL
- Nếu không có: File sẽ được convert sang base64 (fallback)

### Cấu hình:
```env
VITE_UPLOAD_URL=https://your-api.com/api/upload
```

## 2. Lấy nội dung Editor để lưu vào Database

### Cách 1: Sử dụng Hook `useEditorContent` (Khuyến nghị)

```typescript
import { Editor } from './components/editor/Editor';
import { useEditorContent } from './components/editor/useEditorContent';

function MyPage() {
  const { editorRef, editorAPI } = useEditorContent();

  const handleSave = async () => {
    // Lấy nội dung
    const content = editorAPI.getContent();
    // { html: "...", json: {...}, text: "..." }

    // Lưu vào database
    await fetch('/api/content', {
      method: 'POST',
      body: JSON.stringify(content)
    });
  };

  return (
    <div>
      <Editor editorRef={editorRef} />
      <button onClick={handleSave}>Lưu</button>
    </div>
  );
}
```

### Cách 2: Sử dụng Callback `onContentChange`

```typescript
import { Editor } from './components/editor/Editor';

function MyPage() {
  const [content, setContent] = useState(null);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    // Auto-save hoặc debounce save
  };

  const handleSave = async () => {
    if (content) {
      await fetch('/api/content', {
        method: 'POST',
        body: JSON.stringify(content)
      });
    }
  };

  return (
    <div>
      <Editor onContentChange={handleContentChange} />
      <button onClick={handleSave}>Lưu</button>
    </div>
  );
}
```

### Cách 3: Sử dụng Ref trực tiếp

```typescript
import { Editor } from './components/editor/Editor';
import { useRef } from 'react';

function MyPage() {
  const editorRef = useRef(null);

  const handleSave = async () => {
    if (editorRef.current) {
      const content = {
        html: editorRef.current.getHTML(),
        json: editorRef.current.getJSON(),
        text: editorRef.current.getText(),
      };

      await fetch('/api/content', {
        method: 'POST',
        body: JSON.stringify(content)
      });
    }
  };

  return (
    <div>
      <Editor editorRef={editorRef} />
      <button onClick={handleSave}>Lưu</button>
    </div>
  );
}
```

## 3. Load nội dung từ Database

```typescript
import { Editor } from './components/editor/Editor';
import { useEditorContent } from './components/editor/useEditorContent';

function MyPage() {
  const { editorRef, editorAPI } = useEditorContent();

  useEffect(() => {
    // Load content khi component mount
    const loadContent = async () => {
      const response = await fetch('/api/content/123');
      const data = await response.json();
      
      // Set content từ HTML
      editorAPI.setContent(data.html);
      
      // Hoặc từ JSON
      // editorAPI.setContentFromJSON(data.json);
    };

    loadContent();
  }, []);

  return <Editor editorRef={editorRef} initialContent="<p>Loading...</p>" />;
}
```

## 4. API Methods từ `useEditorContent`

```typescript
const { editorAPI } = useEditorContent();

// Lấy HTML
const html = editorAPI.getHTML();

// Lấy JSON (ProseMirror format)
const json = editorAPI.getJSON();

// Lấy plain text
const text = editorAPI.getText();

// Lấy tất cả formats
const content = editorAPI.getContent();
// { html, json, text }

// Set content từ HTML
editorAPI.setContent('<p>Hello</p>');

// Set content từ JSON
editorAPI.setContentFromJSON({ type: 'doc', content: [...] });

// Xóa nội dung
editorAPI.clear();

// Focus editor
editorAPI.focus();

// Blur editor
editorAPI.blur();
```

## 5. Ví dụ đầy đủ: Tích hợp vào Next.js

```typescript
'use client';

import { Editor } from '@/components/editor/Editor';
import { useEditorContent } from '@/components/editor/useEditorContent';
import { useState, useEffect } from 'react';

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const { editorRef, editorAPI } = useEditorContent();
  const [isSaving, setIsSaving] = useState(false);
  const [initialContent, setInitialContent] = useState('');

  // Load content nếu có articleId
  useEffect(() => {
    if (articleId) {
      fetch(`/api/articles/${articleId}`)
        .then(res => res.json())
        .then(data => {
          setInitialContent(data.content);
        });
    }
  }, [articleId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const content = editorAPI.getContent();
      
      await fetch('/api/articles', {
        method: articleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: articleId,
          content: content.html,
          contentJson: content.json,
          excerpt: content.text.slice(0, 200),
        }),
      });

      alert('Đã lưu thành công!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Lưu thất bại!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Editor 
        editorRef={editorRef}
        initialContent={initialContent}
        config={{
          uploadUrl: process.env.NEXT_PUBLIC_UPLOAD_URL,
          mediaLibraryUrl: process.env.NEXT_PUBLIC_MEDIA_LIBRARY_URL,
        }}
      />
      <button 
        onClick={handleSave} 
        disabled={isSaving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isSaving ? 'Đang lưu...' : 'Lưu bài viết'}
      </button>
    </div>
  );
}
```

## 6. Props của Editor Component

```typescript
interface EditorComponentProps {
  // Cấu hình upload và API
  config?: EditorConfig;
  
  // Callback khi content thay đổi
  onContentChange?: (content: { html: string; json: any; text: string }) => void;
  
  // Nội dung ban đầu (HTML)
  initialContent?: string;
  
  // Ref để truy cập editor instance từ bên ngoài
  editorRef?: React.MutableRefObject<any>;
}
```

## Lưu ý:

1. **Drag & Drop tự động upload**: Chỉ hoạt động nếu có `uploadUrl` trong config
2. **Fallback**: Nếu không có uploadUrl, file sẽ được convert sang base64
3. **Performance**: `onContentChange` có thể được gọi nhiều lần, nên debounce nếu cần auto-save
4. **Initial Content**: Chỉ được set một lần khi component mount, không tự động update khi prop thay đổi

