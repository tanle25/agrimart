'use client';
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X, Image, Heading, Eye, FileText } from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion?: string;
}

interface AccessibilityCheckerProps {
  editor: any;
  onClose: () => void;
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({ editor, onClose }) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const checkAccessibility = () => {
    if (!editor) return;

    setIsChecking(true);
    const foundIssues: AccessibilityIssue[] = [];

    const html = editor.getHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Check images without alt text
    const images = doc.querySelectorAll('img');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        foundIssues.push({
          type: 'error',
          message: `Ảnh #${index + 1} thiếu alt text`,
          element: 'img',
          suggestion: 'Thêm mô tả alt text cho ảnh để hỗ trợ screen readers',
        });
      }
    });

    // Check heading hierarchy
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (index === 0 && level !== 1) {
        foundIssues.push({
          type: 'warning',
          message: 'Document nên bắt đầu với H1',
          element: 'heading',
          suggestion: 'Đảm bảo có ít nhất một H1 ở đầu document',
        });
      }
      if (level > previousLevel + 1 && previousLevel > 0) {
        foundIssues.push({
          type: 'warning',
          message: `Heading hierarchy không đúng: ${heading.tagName} sau H${previousLevel}`,
          element: 'heading',
          suggestion: 'Không được bỏ qua cấp độ heading (ví dụ: H1 → H3)',
        });
      }
      previousLevel = level;
    });

    // Check links without text
    const links = doc.querySelectorAll('a');
    links.forEach((link, index) => {
      const text = link.textContent?.trim();
      if (!text || text === '') {
        foundIssues.push({
          type: 'error',
          message: `Link #${index + 1} không có text`,
          element: 'a',
          suggestion: 'Thêm text mô tả cho link',
        });
      }
    });

    // Check color contrast (simplified)
    const textElements = doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    textElements.forEach((el) => {
      const style = window.getComputedStyle(el as Element);
      const color = style.color;
      const bgColor = style.backgroundColor;
      
      // Basic check - in production, use a proper contrast checker
      if (color === bgColor || (color === 'rgb(0, 0, 0)' && bgColor === 'rgb(0, 0, 0)')) {
        foundIssues.push({
          type: 'warning',
          message: 'Có thể có vấn đề về độ tương phản màu',
          element: 'text',
          suggestion: 'Đảm bảo tỷ lệ tương phản tối thiểu 4.5:1 cho text thường',
        });
      }
    });

    // Check tables without headers
    const tables = doc.querySelectorAll('table');
    tables.forEach((table, index) => {
      const hasHeaders = table.querySelectorAll('th').length > 0;
      if (!hasHeaders) {
        foundIssues.push({
          type: 'warning',
          message: `Bảng #${index + 1} không có header`,
          element: 'table',
          suggestion: 'Thêm <th> elements để làm header cho bảng',
        });
      }
    });

    // Check for empty paragraphs
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
      const text = p.textContent?.trim();
      if (!text || text === '') {
        foundIssues.push({
          type: 'info',
          message: `Paragraph #${index + 1} trống`,
          element: 'p',
          suggestion: 'Xóa các paragraph trống để cải thiện cấu trúc',
        });
      }
    });

    setTimeout(() => {
      setIssues(foundIssues);
      setIsChecking(false);
    }, 500);
  };

  useEffect(() => {
    checkAccessibility();
  }, []);

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return <CheckCircle2 size={16} className="text-blue-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[700px] max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye size={18} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Kiểm tra Accessibility</h3>
              <p className="text-xs text-gray-500">Phát hiện các vấn đề về khả năng truy cập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isChecking ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600">Đang kiểm tra...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 size={48} className="text-green-500 mb-4" />
              <p className="text-lg font-semibold text-gray-800 mb-1">Tuyệt vời!</p>
              <p className="text-sm text-gray-500">Không phát hiện vấn đề về accessibility</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-700">
                  Tìm thấy {issues.length} vấn đề
                </div>
                <button
                  onClick={checkAccessibility}
                  className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Kiểm tra lại
                </button>
              </div>

              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getIssueColor(issue.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {issue.message}
                        </span>
                        {issue.element && (
                          <span className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-600">
                            {issue.element}
                          </span>
                        )}
                      </div>
                      {issue.suggestion && (
                        <p className="text-xs text-gray-600 mt-1">{issue.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

