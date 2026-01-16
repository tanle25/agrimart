'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Crop, Maximize2, Download, Check, ZoomIn, ZoomOut, Sun, Contrast } from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedSrc: string) => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onClose }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isCropping, setIsCropping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };
    img.src = imageSrc;
  }, [imageSrc, brightness, contrast, saturation, rotation]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const editedSrc = canvas.toDataURL('image/png');
    onSave(editedSrc);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setZoom(100);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-[900px] max-w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Crop size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Chỉnh sửa ảnh</h3>
              <p className="text-xs text-gray-500">Điều chỉnh độ sáng, độ tương phản và nhiều hơn nữa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Controls */}
          <div className="w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto space-y-4">
            
            {/* Brightness */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <Sun size={12} />
                Độ sáng: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <Contrast size={12} />
                Độ tương phản: {contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Độ bão hòa màu: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Xoay: {rotation}°
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  onClick={rotateImage}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Xoay 90°"
                >
                  <RotateCw size={16} />
                </button>
              </div>
            </div>

            {/* Zoom */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Zoom: {zoom}%
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setZoom((prev) => Math.max(25, prev - 25))}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min="25"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  onClick={() => setZoom((prev) => Math.min(200, prev + 25))}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Reset tất cả
              </button>
            </div>
          </div>

          {/* Right Preview */}
          <div className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-auto">
            <div style={{ transform: `scale(${zoom / 100})` }} className="transition-transform">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[70vh] border border-gray-700 rounded-lg shadow-2xl"
              />
            </div>
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
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <Check size={16} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

