'use client';
import React, { useState, useEffect, useRef } from 'react';
import { History, X, Save, Download, RotateCcw, GitCompare, Clock } from 'lucide-react';

interface Version {
  id: string;
  timestamp: number;
  content: string;
  preview: string;
  label?: string;
}

interface VersionHistoryProps {
  editor: any;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ editor, onClose }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([null, null]);
  const [isComparing, setIsComparing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load versions from localStorage
    const saved = localStorage.getItem('editor-versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVersions(parsed);
      } catch (e) {
        console.error('Failed to load versions:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const saveCurrentVersion = () => {
    if (!editor) return;

    const content = editor.getHTML();
    const preview = editor.getText().slice(0, 100) + (editor.getText().length > 100 ? '...' : '');
    
    const label = window.prompt('Nhập nhãn cho version này (tùy chọn):', '');
    
    const version: Version = {
      id: `v${Date.now()}`,
      timestamp: Date.now(),
      content,
      preview: preview || '(Empty)',
      label: label || undefined,
    };

    const updated = [version, ...versions].slice(0, 50); // Keep last 50 versions
    setVersions(updated);
    localStorage.setItem('editor-versions', JSON.stringify(updated));
    
    alert('Đã lưu version thành công!');
  };

  const restoreVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version || !editor) return;

    if (confirm('Bạn có chắc muốn khôi phục version này? Thay đổi hiện tại sẽ bị mất.')) {
      editor.commands.setContent(version.content);
      onClose();
    }
  };

  const deleteVersion = (versionId: string) => {
    if (confirm('Bạn có chắc muốn xóa version này?')) {
      const updated = versions.filter(v => v.id !== versionId);
      setVersions(updated);
      localStorage.setItem('editor-versions', JSON.stringify(updated));
    }
  };

  const exportVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    const blob = new Blob([version.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `version-${versionId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compareVersions = () => {
    const [v1, v2] = selectedVersions;
    if (!v1 || !v2) {
      alert('Vui lòng chọn 2 version để so sánh');
      return;
    }

    setIsComparing(true);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVersionContent = (versionId: string) => {
    return versions.find(v => v.id === versionId)?.content || '';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div ref={ref} className="bg-white w-[900px] max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            Lịch sử phiên bản
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={saveCurrentVersion}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1"
            >
              <Save size={14} />
              Lưu version hiện tại
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {!isComparing ? (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Chưa có version nào được lưu</p>
                  <p className="text-sm">Nhấn "Lưu version hiện tại" để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => {
                    const isSelected = selectedVersions.includes(version.id);
                    return (
                      <div
                        key={version.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                {version.label || version.id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(version.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{version.preview}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newSelection: [string | null, string | null] = isSelected
                                    ? selectedVersions.filter(id => id !== version.id) as [string | null, string | null]
                                    : selectedVersions[0] === null
                                    ? [version.id, selectedVersions[1]]
                                    : [selectedVersions[0], version.id];
                                  setSelectedVersions(newSelection);
                                }}
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected ? 'Đã chọn' : 'Chọn để so sánh'}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => restoreVersion(version.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Khôi phục version này"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={() => exportVersion(version.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Export version"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => deleteVersion(version.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa version"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {versions.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {versions.length} version đã lưu
                  {selectedVersions.filter(Boolean).length === 2 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • 2 version đã chọn để so sánh
                    </span>
                  )}
                </div>
                {selectedVersions.filter(Boolean).length === 2 && (
                  <button
                    onClick={compareVersions}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                  >
                    <GitCompare size={16} />
                    So sánh 2 version
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">So sánh version</h4>
              <button
                onClick={() => {
                  setIsComparing(false);
                  setSelectedVersions([null, null]);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Quay lại
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">Version 1</div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getVersionContent(selectedVersions[0]!) }}
                />
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-500 mb-2">Version 2</div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: getVersionContent(selectedVersions[1]!) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

