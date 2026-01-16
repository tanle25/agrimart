"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { AgriImage } from '@/components/ui/AgriImage';

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    count?: number; // Optional from API
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function CategoryManagerPage() {
    // State
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image: '',
        description: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/product-categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from name if creating or if slug matches old name
        if (name === 'name' && (!editingId || !formData.slug)) {
            const newSlug = value.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");
            setFormData(prev => ({ ...prev, slug: newSlug }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const data = new FormData();
            data.append('file', file);

            try {
                const res = await fetch(`${BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    body: data
                });
                const result = await res.json();
                if (result.url) {
                    setFormData(prev => ({ ...prev, image: result.url }));
                }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Lỗi tải ảnh");
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return alert("Vui lòng nhập tên danh mục");

        setIsSubmitting(true);
        try {
            const url = editingId
                ? `${BACKEND_URL}/api/product-categories/${editingId}`
                : `${BACKEND_URL}/api/product-categories`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(editingId ? "Cập nhật thành công" : "Tạo danh mục thành công");
                fetchCategories();
                resetForm();
            } else {
                alert("Có lỗi xảy ra");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (cat: ProductCategory) => {
        setEditingId(cat.id);
        setFormData({
            name: cat.name,
            slug: cat.slug || '',
            image: cat.image || '',
            description: cat.description || ''
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/product-categories/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id));
                if (editingId === id) resetForm();
            } else {
                alert("Không thể xóa danh mục");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', slug: '', image: '', description: '' });
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh mục sản phẩm</h1>
                    <p className="text-gray-500 text-sm">Quản lý phân loại sản phẩm của cửa hàng.</p>
                </div>
                {/* Header Add Button Removed as requested */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Đang tải danh mục...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Hình ảnh</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tên danh mục</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-500">Chưa có danh mục nào.</td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${editingId === cat.id ? 'bg-emerald-50' : ''}`}>
                                            <td className="px-6 py-3 w-16">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    {cat.image ? (
                                                        <AgriImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                {cat.name}
                                                {cat.description && <p className="text-xs text-gray-400 font-normal truncate max-w-[200px]">{cat.description}</p>}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{cat.slug}</td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Add/Edit Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">
                            {editingId ? 'Sửa danh mục' : 'Thêm nhanh'}
                        </h3>
                        {editingId && (
                            <button onClick={resetForm} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                <X className="w-3 h-3" /> Hủy sửa
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Nhập tên..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Slug)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                                placeholder="tu-dong-tao"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder="Mô tả ngắn..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hình đại diện</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer bg-gray-50 relative overflow-hidden group"
                            >
                                {formData.image ? (
                                    <>
                                        <AgriImage src={formData.image} alt="Preview" className="w-full h-32 object-contain" />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white font-medium">
                                            Thay đổi ảnh
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-xs">Nhấn để tải ảnh</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingId ? 'Cập nhật danh mục' : 'Lưu danh mục'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
