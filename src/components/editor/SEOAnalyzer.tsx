'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle2, AlertTriangle, TrendingUp, FileText, Hash } from 'lucide-react';

interface SEOIssue {
  type: 'good' | 'warning' | 'error';
  category: string;
  message: string;
  score: number;
  suggestion?: string;
}

interface SEOAnalyzerProps {
  editor: any;
  onClose: () => void;
}

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({ editor, onClose }) => {
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState('');
  const [skipH1Check, setSkipH1Check] = useState(false);
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

  const analyzeSEO = () => {
    if (!editor) return;

    setIsAnalyzing(true);
    const foundIssues: SEOIssue[] = [];
    let totalScore = 0;
    let maxScore = 0;

    const html = editor.getHTML();
    const text = editor.getText();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Word count
    const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;
    maxScore += 10;
    if (wordCount >= 300) {
      foundIssues.push({ type: 'good', category: 'Content Length', message: `Word count: ${wordCount} (Tốt)`, score: 10 });
      totalScore += 10;
    } else if (wordCount >= 150) {
      foundIssues.push({ type: 'warning', category: 'Content Length', message: `Word count: ${wordCount} (Nên có ít nhất 300 từ)`, score: 5, suggestion: 'Thêm nội dung để đạt tối thiểu 300 từ' });
      totalScore += 5;
    } else {
      foundIssues.push({ type: 'error', category: 'Content Length', message: `Word count: ${wordCount} (Quá ngắn)`, score: 0, suggestion: 'Nội dung quá ngắn, nên có ít nhất 300 từ' });
    }

    // Heading structure
    const h1s = doc.querySelectorAll('h1');
    const h2s = doc.querySelectorAll('h2');
    
    if (!skipH1Check) {
      maxScore += 15;
      if (h1s.length === 1) {
        foundIssues.push({ type: 'good', category: 'Headings', message: 'Có đúng 1 H1', score: 5 });
        totalScore += 5;
      } else if (h1s.length === 0) {
        foundIssues.push({ type: 'error', category: 'Headings', message: 'Thiếu H1', score: 0, suggestion: 'Thêm một H1 chứa từ khóa chính' });
      } else {
        foundIssues.push({ type: 'warning', category: 'Headings', message: `Có ${h1s.length} H1 (Nên chỉ có 1)`, score: 2, suggestion: 'Chỉ nên có một H1 trong document' });
        totalScore += 2;
      }

      if (h2s.length >= 2) {
        foundIssues.push({ type: 'good', category: 'Headings', message: `Có ${h2s.length} H2 (Tốt)`, score: 10 });
        totalScore += 10;
      } else {
        foundIssues.push({ type: 'warning', category: 'Headings', message: `Chỉ có ${h2s.length} H2`, score: 5, suggestion: 'Nên có ít nhất 2-3 H2 để cấu trúc tốt hơn' });
        totalScore += 5;
      }
    } else {
      // Skip H1 check, only check H2+
      maxScore += 10;
      if (h2s.length >= 2) {
        foundIssues.push({ type: 'good', category: 'Headings', message: `Có ${h2s.length} H2 (Tốt)`, score: 10 });
        totalScore += 10;
      } else {
        foundIssues.push({ type: 'warning', category: 'Headings', message: `Chỉ có ${h2s.length} H2`, score: 5, suggestion: 'Nên có ít nhất 2-3 H2 để cấu trúc tốt hơn' });
        totalScore += 5;
      }
    }

    // Images with alt text
    const images = doc.querySelectorAll('img');
    maxScore += 10;
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt') && img.getAttribute('alt')!.trim() !== '').length;
    if (images.length === 0) {
      foundIssues.push({ type: 'good', category: 'Images', message: 'Không có ảnh', score: 10 });
      totalScore += 10;
    } else if (imagesWithAlt === images.length) {
      foundIssues.push({ type: 'good', category: 'Images', message: `Tất cả ${images.length} ảnh đều có alt text`, score: 10 });
      totalScore += 10;
    } else {
      foundIssues.push({ type: 'warning', category: 'Images', message: `${imagesWithAlt}/${images.length} ảnh có alt text`, score: Math.round((imagesWithAlt / images.length) * 10), suggestion: 'Thêm alt text cho tất cả ảnh' });
      totalScore += Math.round((imagesWithAlt / images.length) * 10);
    }

    // Links
    const links = doc.querySelectorAll('a');
    maxScore += 10;
    if (links.length >= 2) {
      foundIssues.push({ type: 'good', category: 'Links', message: `Có ${links.length} links (Tốt)`, score: 10 });
      totalScore += 10;
    } else {
      foundIssues.push({ type: 'warning', category: 'Links', message: `Chỉ có ${links.length} link`, score: 5, suggestion: 'Thêm internal/external links để cải thiện SEO' });
      totalScore += 5;
    }

    // Keyword density (if focus keyword provided)
    if (focusKeyword.trim()) {
      const keyword = focusKeyword.toLowerCase();
      const keywordCount = (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;
      maxScore += 15;
      
      if (density >= 0.5 && density <= 2.5) {
        foundIssues.push({ type: 'good', category: 'Keyword', message: `Keyword density: ${density.toFixed(2)}% (Tốt)`, score: 15 });
        totalScore += 15;
      } else if (density < 0.5) {
        foundIssues.push({ type: 'warning', category: 'Keyword', message: `Keyword density: ${density.toFixed(2)}% (Thấp)`, score: 7, suggestion: 'Tăng số lần xuất hiện của từ khóa' });
        totalScore += 7;
      } else {
        foundIssues.push({ type: 'warning', category: 'Keyword', message: `Keyword density: ${density.toFixed(2)}% (Cao)`, score: 7, suggestion: 'Giảm số lần xuất hiện để tránh keyword stuffing' });
        totalScore += 7;
      }
    }

    // Readability (simplified)
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    maxScore += 10;
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      foundIssues.push({ type: 'good', category: 'Readability', message: `Trung bình ${avgWordsPerSentence.toFixed(1)} từ/câu (Tốt)`, score: 10 });
      totalScore += 10;
    } else {
      foundIssues.push({ type: 'warning', category: 'Readability', message: `Trung bình ${avgWordsPerSentence.toFixed(1)} từ/câu`, score: 5, suggestion: 'Nên có 15-20 từ mỗi câu để dễ đọc' });
      totalScore += 5;
    }

    setTimeout(() => {
      setIssues(foundIssues);
      setOverallScore(Math.round((totalScore / maxScore) * 100));
      setIsAnalyzing(false);
    }, 800);
  };

  useEffect(() => {
    analyzeSEO();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'good':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return <AlertTriangle size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[800px] max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">SEO Analyzer</h3>
              <p className="text-xs text-gray-500">Phân tích và tối ưu SEO cho document</p>
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
        <div className="flex-1 overflow-y-auto p-5">
          {/* Focus Keyword Input */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block flex items-center gap-1">
              <Hash size={12} />
              Focus Keyword (tùy chọn)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="Nhập từ khóa chính..."
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <button
                onClick={analyzeSEO}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Phân tích lại
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipH1Check}
                onChange={(e) => {
                  setSkipH1Check(e.target.checked);
                  setTimeout(() => analyzeSEO(), 100);
                }}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-xs text-gray-600">
                Bỏ qua kiểm tra H1 (tiêu đề bài viết đã là H1)
              </span>
            </label>
          </div>

          {/* Overall Score */}
          <div className={`mb-6 p-6 rounded-xl border-2 ${getScoreColor(overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1">SEO Score</div>
                <div className="text-4xl font-bold">{overallScore}</div>
                <div className="text-sm mt-1">
                  {overallScore >= 80 ? 'Tuyệt vời!' : overallScore >= 60 ? 'Tốt' : 'Cần cải thiện'}
                </div>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="opacity-20"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600">Đang phân tích...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    issue.type === 'good' ? 'bg-green-50 border-green-200' :
                    issue.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIssueIcon(issue.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {issue.message}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-600">
                            {issue.category}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          issue.type === 'good' ? 'bg-green-200 text-green-700' :
                          issue.type === 'warning' ? 'bg-amber-200 text-amber-700' :
                          'bg-red-200 text-red-700'
                        }`}>
                          {issue.score} điểm
                        </span>
                      </div>
                      {issue.suggestion && (
                        <p className="text-xs text-gray-600 mt-1">💡 {issue.suggestion}</p>
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

