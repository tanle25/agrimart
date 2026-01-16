'use client';

/**
 * Editor Configuration
 * Cấu hình URL cho upload và media library
 * Compatible with both Vite (import.meta.env) and Next.js (process.env)
 */

export interface EditorConfig {
  // URL để upload media files
  uploadUrl?: string;

  // URL để lấy danh sách media từ library
  mediaLibraryUrl?: string;

  // API endpoint để lưu nội dung editor
  saveContentUrl?: string;

  // API endpoint để load nội dung editor
  loadContentUrl?: string;

  // Headers cho API requests (nếu cần authentication)
  apiHeaders?: Record<string, string>;
}

// Default config - có thể override từ environment variables hoặc props
// Next.js: Use process.env with NEXT_PUBLIC_ prefix for client-side variables
// Vite: Use import.meta.env with VITE_ prefix
const getEnvVar = (viteName: string, nextjsName: string): string | undefined => {
  // Check for Next.js environment variable first
  if (typeof process !== 'undefined' && process.env) {
    const nextjsValue = process.env[nextjsName];
    if (nextjsValue) return nextjsValue;
  }

  // Fallback to Vite environment variable (for Vite projects)
  // Use try-catch to safely check for import.meta.env
  try {
    // @ts-ignore - import.meta is only available in Vite/ESM environments
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const viteValue = import.meta.env[viteName];
      if (viteValue) return viteValue;
    }
  } catch (e) {
    // import.meta not available (Next.js environment)
    // This is expected and safe to ignore
  }

  return undefined;
};

export const defaultEditorConfig: EditorConfig = {
  uploadUrl: getEnvVar('VITE_UPLOAD_URL', 'NEXT_PUBLIC_UPLOAD_URL'),
  mediaLibraryUrl: getEnvVar('VITE_MEDIA_LIBRARY_URL', 'NEXT_PUBLIC_MEDIA_LIBRARY_URL'),
  saveContentUrl: getEnvVar('VITE_SAVE_CONTENT_URL', 'NEXT_PUBLIC_SAVE_CONTENT_URL'),
  loadContentUrl: getEnvVar('VITE_LOAD_CONTENT_URL', 'NEXT_PUBLIC_LOAD_CONTENT_URL'),
  apiHeaders: {
    'Content-Type': 'application/json',
  },
};

/**
 * Upload file to server
 */
export async function uploadFile(
  file: File,
  config: EditorConfig = defaultEditorConfig
): Promise<string> {
  if (!config.uploadUrl) {
    // Fallback to base64 if no upload URL configured
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);

  console.log('Starting upload to:', config.uploadUrl);
  try {
    const response = await fetch(config.uploadUrl, {
      method: 'POST',
      body: formData,
      // headers: config.apiHeaders, // KHÔNG được set Content-Type là application/json khi gửi FormData, browser sẽ tự set boundary
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with text:', errorText);
      throw new Error(`Upload failed: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    console.log('Upload success data:', data);
    return data.url || data.path || data.fileUrl;
  } catch (err) {
    console.error('Fetch error in uploadFile:', err);
    throw err;
  }
}

/**
 * Get media library items
 */
export async function getMediaLibrary(
  type: 'image' | 'video' | 'audio',
  config: EditorConfig = defaultEditorConfig
): Promise<string[]> {
  if (!config.mediaLibraryUrl) {
    return [];
  }

  const response = await fetch(`${config.mediaLibraryUrl}?type=${type}`, {
    method: 'GET',
    headers: config.apiHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to load media library: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items || data.urls || [];
}

/**
 * Save editor content to server
 */
export async function saveContent(
  content: {
    html?: string;
    json?: any;
    text?: string;
  },
  config: EditorConfig = defaultEditorConfig
): Promise<any> {
  if (!config.saveContentUrl) {
    console.warn('No saveContentUrl configured. Content not saved.');
    return null;
  }

  const response = await fetch(config.saveContentUrl, {
    method: 'POST',
    headers: {
      ...config.apiHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error(`Failed to save content: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Load editor content from server
 */
export async function loadContent(
  contentId: string,
  config: EditorConfig = defaultEditorConfig
): Promise<{ html?: string; json?: any; text?: string }> {
  if (!config.loadContentUrl) {
    throw new Error('No loadContentUrl configured');
  }

  const response = await fetch(`${config.loadContentUrl}/${contentId}`, {
    method: 'GET',
    headers: config.apiHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to load content: ${response.statusText}`);
  }

  return response.json();
}

