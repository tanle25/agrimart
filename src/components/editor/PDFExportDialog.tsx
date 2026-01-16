'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FileText, X, Download, Settings, Check } from 'lucide-react';
import { exportAsPDF } from './ExportUtils';

interface PDFExportDialogProps {
  editor: any;
  onClose: () => void;
}

const PAGE_SIZES = [
  { label: 'A4', value: 'a4', width: 210, height: 297 },
  { label: 'Letter', value: 'letter', width: 216, height: 279 },
  { label: 'Legal', value: 'legal', width: 216, height: 356 },
  { label: 'A3', value: 'a3', width: 297, height: 420 },
];

const ORIENTATIONS = [
  { label: 'Portrait', value: 'portrait' },
  { label: 'Landscape', value: 'landscape' },
];

export const PDFExportDialog: React.FC<PDFExportDialogProps> = ({ editor, onClose }) => {
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState(20);
  const [includeHeader, setIncludeHeader] = useState(false);
  const [includeFooter, setIncludeFooter] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [pageNumbers, setPageNumbers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    if (!editor) return;

    setIsExporting(true);
    try {
      const content = editor.getHTML();
      
      // Create styled HTML with PDF settings
      const pdfHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              @page {
                size: ${PAGE_SIZES.find(s => s.value === pageSize)?.label || 'A4'} ${orientation};
                margin: ${margin}mm;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000;
              }
              ${includeHeader ? `
                .header {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  text-align: center;
                  padding: 10px;
                  border-bottom: 1px solid #ddd;
                }
              ` : ''}
              ${includeFooter ? `
                .footer {
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  text-align: center;
                  padding: 10px;
                  border-top: 1px solid #ddd;
                }
              ` : ''}
              img { max-width: 100%; height: auto; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; }
            </style>
          </head>
          <body>
            ${includeHeader ? `<div class="header">${headerText || 'Document Header'}</div>` : ''}
            <div class="content">
              ${content}
            </div>
            ${includeFooter ? `<div class="footer">${footerText || (pageNumbers ? 'Page <span class="page-number"></span>' : 'Document Footer')}</div>` : ''}
          </body>
        </html>
      `;

      await exportAsPDF(pdfHtml, 'document.pdf');
      onClose();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Không thể xuất PDF. Vui lòng thử lại hoặc sử dụng Print.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Export PDF</h3>
              <p className="text-xs text-gray-500">Tùy chỉnh cài đặt PDF</p>
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
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Page Size */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kích thước trang</label>
            <div className="grid grid-cols-4 gap-2">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setPageSize(size.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pageSize === size.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hướng trang</label>
            <div className="flex gap-2">
              {ORIENTATIONS.map((orient) => (
                <button
                  key={orient.value}
                  onClick={() => setOrientation(orient.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orientation === orient.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {orient.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Lề: {margin}mm
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Header
            </label>
            {includeHeader && (
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Header text..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            )}
          </div>

          {/* Footer */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <input
                type="checkbox"
                checked={includeFooter}
                onChange={(e) => setIncludeFooter(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Footer
            </label>
            {includeFooter && (
              <>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Footer text..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Hiển thị số trang
                </label>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download size={16} />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

