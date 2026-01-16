'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Twitter, Instagram, Code, FileText, X, Check, ExternalLink } from 'lucide-react';

interface EmbedDialogProps {
  editor: any;
  onClose: () => void;
  onInsert: (html: string) => void;
}

const EMBED_TYPES = [
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username/status/1234567890' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://www.instagram.com/p/ABC123/' },
  { id: 'codepen', label: 'CodePen', icon: Code, placeholder: 'https://codepen.io/username/pen/ABC123' },
  { id: 'jsfiddle', label: 'JSFiddle', icon: Code, placeholder: 'https://jsfiddle.net/username/ABC123' },
  { id: 'youtube', label: 'YouTube', icon: FileText, placeholder: 'https://www.youtube.com/watch?v=ABC123' },
  { id: 'custom', label: 'Custom HTML', icon: Globe, placeholder: '<iframe src="..."></iframe>' },
];

export const EmbedDialog: React.FC<EmbedDialogProps> = ({ editor, onClose, onInsert }) => {
  const [selectedType, setSelectedType] = useState('twitter');
  const [url, setUrl] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (urlInputRef.current && selectedType !== 'custom') {
      urlInputRef.current.focus();
    }
  }, [selectedType]);

  const generateEmbedHtml = (type: string, input: string): string => {
    if (type === 'custom') {
      return customHtml;
    }

    if (type === 'twitter') {
      const tweetId = input.match(/status\/(\d+)/)?.[1];
      if (tweetId) {
        return `<blockquote class="twitter-tweet" data-theme="light"><a href="${input}">Loading tweet...</a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
      }
    }

    if (type === 'instagram') {
      const postId = input.match(/\/p\/([^\/]+)/)?.[1];
      if (postId) {
        return `<blockquote class="instagram-media" data-instgrm-permalink="${input}" data-instgrm-version="14"></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
      }
    }

    if (type === 'codepen') {
      const penId = input.match(/pen\/([^\/]+)/)?.[1];
      if (penId) {
        return `<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html,result" data-slug-hash="${penId}" data-user="username" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;"><span>See the Pen <a href="${input}">Untitled</a> on CodePen.</span></p><script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>`;
      }
    }

    if (type === 'jsfiddle') {
      return `<iframe width="100%" height="300" src="${input}/embedded/js,html,css,result/light/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>`;
    }

    if (type === 'youtube') {
      const videoId = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `<div data-youtube-video><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
    }

    return '';
  };

  const handlePreview = () => {
    const html = generateEmbedHtml(selectedType, selectedType === 'custom' ? customHtml : url);
    setPreview(html);
  };

  const handleInsert = () => {
    const html = generateEmbedHtml(selectedType, selectedType === 'custom' ? customHtml : url);
    if (html) {
      onInsert(html);
      onClose();
    } else {
      alert('Vui lòng nhập URL hợp lệ');
    }
  };

  const selectedEmbed = EMBED_TYPES.find(t => t.id === selectedType);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[700px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Chèn Embed</h3>
              <p className="text-xs text-gray-500">Nhúng nội dung từ các nền tảng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex">
          {/* Left - Type Selection */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-3 space-y-1">
            {EMBED_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setPreview(null);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-white text-green-600 shadow-sm border border-green-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Right - Input & Preview */}
          <div className="flex-1 p-5 space-y-4">
            {selectedType === 'custom' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Custom HTML
                </label>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="<iframe src='...'></iframe>"
                  rows={6}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400 resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                  <ExternalLink size={12} />
                  URL {selectedEmbed?.label}
                </label>
                <input
                  ref={urlInputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={selectedEmbed?.placeholder}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Preview</div>
                <div 
                  className="bg-white rounded border border-gray-200 p-4 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
            )}

            {/* Info */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-xs text-green-700">
              <p className="font-medium mb-1">💡 Lưu ý:</p>
              <ul className="list-disc list-inside space-y-0.5 text-green-600">
                <li>Một số embed cần thời gian để load</li>
                <li>Đảm bảo URL hợp lệ và công khai</li>
                <li>Custom HTML sẽ được chèn trực tiếp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handlePreview}
            disabled={selectedType === 'custom' ? !customHtml.trim() : !url.trim()}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleInsert}
            disabled={selectedType === 'custom' ? !customHtml.trim() : !url.trim()}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Check size={16} />
            Chèn Embed
          </button>
        </div>
      </div>
    </div>
  );
};

