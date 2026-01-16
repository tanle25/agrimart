"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    description?: string;
    className?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function ImageUploader({
    value,
    onChange,
    label,
    placeholder = "Tải lên hình ảnh",
    description = "PNG, JPG tối đa 2MB",
    className = ""
}: ImageUploaderProps) {
    const { success, error: showError } = useToast();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            showError("File quá lớn. Vui lòng chọn file < 2MB.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            // Assuming backend returns relative path like /api/media/filename.webp
            // We prepend BACKEND_URL if it's not already absolute
            const fullUrl = data.url.startsWith('http') ? data.url : `${BACKEND_URL}${data.url}`;
            onChange(fullUrl);
            success("Tải ảnh lên thành công");
        } catch (err) {
            console.error("Upload error:", err);
            showError("Có lỗi khi tải ảnh lên.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed border-gray-300 rounded-lg p-6 
                    flex flex-col items-center justify-center text-center 
                    bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 transition-colors 
                    cursor-pointer group relative overflow-hidden
                    ${uploading ? 'opacity-70 pointer-events-none' : ''}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />

                {uploading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                )}

                {value ? (
                    <div className="relative group w-full flex flex-col items-center">
                        <div className="relative h-24 w-full mb-3">
                            <img src={value} alt="Preview" className="h-full w-full object-contain" />
                            <button
                                onClick={handleClear}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 break-all w-full truncate px-4">{value}</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                            <div className="bg-emerald-600 p-1.5 rounded">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">{placeholder}</p>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </>
                )}
            </div>

            {/* Manual URL Input Fallback */}
            <input
                className="w-full mt-2 text-xs border border-gray-200 rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none text-gray-600 placeholder-gray-400"
                placeholder="Hoặc nhập URL hình ảnh trực tiếp..."
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
