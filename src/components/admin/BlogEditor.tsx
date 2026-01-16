"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Upload,
    X,
    Calendar,
    Clock,
    User,
    Tag,
    Globe,
    Check,
    Edit2,
    Loader2,
    FolderOpen,
    Plus,
    Pencil,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AgriImage } from '@/components/ui/AgriImage';

const Editor = dynamic(
    () => import('@/components/editor/Editor').then((mod) => ({ default: mod.Editor })),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Editor...</div> }
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface BlogEditorProps {
    id?: string;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
}

export default function BlogEditor({ id }: BlogEditorProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [author, setAuthor] = useState('Admin'); // Could be fetched from user profile
    const [image, setImage] = useState('');
    // const [readTime, setReadTime] = useState('5 phút'); // Removed
    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [status, setStatus] = useState('published');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Fields
    const [isFeatured, setIsFeatured] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [mainKeyword, setMainKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(!!id); // Loading if id exists

    // Category Management
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

    // Tags Management
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Fetch Categories
    useEffect(() => {
        fetch(`${BACKEND_URL}/api/blog-categories`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to load categories", err));
    }, []);

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) return;
        const trimmedName = newCategoryName.trim();

        try {
            if (isEditingCategory && editingCategoryId) {
                // Edit Mode (API)
                const res = await fetch(`${BACKEND_URL}/api/blog-categories/${editingCategoryId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: trimmedName })
                });
                if (res.ok) {
                    const updatedCat = await res.json();
                    setCategories(categories.map(c => c.id === editingCategoryId ? updatedCat : c));
                    setCategoryId(updatedCat.id); // Update selected category ID
                    setIsEditingCategory(false);
                    setEditingCategoryId(null);
                } else {
                    alert('Lỗi cập nhật danh mục');
                }
            } else {
                // Create Mode (API)
                // Check duplicate locally first (optional, easier feedback)
                if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
                    const existing = categories.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
                    if (existing) setCategoryId(existing.id); // Just select it
                    setIsCreatingCategory(false);
                    return;
                }

                const res = await fetch(`${BACKEND_URL}/api/blog-categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: trimmedName })
                });
                if (res.ok) {
                    const newCat = await res.json();
                    setCategories([...categories, newCat]);
                    setCategoryId(newCat.id);
                    setIsCreatingCategory(false);
                } else {
                    alert('Lỗi tạo danh mục');
                }
            }
            setNewCategoryName('');
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        }
    };

    const startEditCategory = () => {
        if (!categoryId) return;
        const cat = categories.find(c => c.id === categoryId);
        if (!cat) return; // Should not happen

        setIsEditingCategory(true);
        setNewCategoryName(cat.name);
        setEditingCategoryId(cat.id);
        setIsCreatingCategory(false);
    };

    const handleDeleteCategory = async () => {
        if (!categoryId) return;
        const cat = categories.find(c => c.id === categoryId);
        if (!cat) return;

        if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/blog-categories/${cat.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setCategories(categories.filter(c => c.id !== cat.id));
                setCategoryId(null);
            } else {
                alert('Không thể xóa danh mục này');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối');
        }
    };

    // Tag Handlers
    const handleAddTag = (val: string) => {
        const trimmed = val.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(tagInput);
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            handleRemoveTag(tags[tags.length - 1]);
        }
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.endsWith(',')) {
            handleAddTag(val.slice(0, -1));
        } else {
            setTagInput(val);
        }
    };



    // Media Library State
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [libraryImages, setLibraryImages] = useState<string[]>([]);

    // Fetch Library Images
    useEffect(() => {
        if (showMediaLibrary) {
            fetch(`${BACKEND_URL}/api/media`)
                .then(res => res.json())
                .then(data => setLibraryImages(data.items || []))
                .catch(err => console.error("Failed to load library", err));
        }
    }, [showMediaLibrary]);

    // Load data if editing
    useEffect(() => {
        if (id) {
            setIsLoading(true);
            fetch(`${BACKEND_URL}/api/blog/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch post");
                    return res.json();
                })
                .then(post => {
                    setTitle(post.title);
                    setSlug(post.slug);
                    setExcerpt(post.excerpt || '');
                    setContent(post.content || '');
                    setCategoryId(post.categoryId || null);
                    setTags(post.tags || []);
                    setAuthor(post.author || 'Admin');
                    setImage(post.image || '');
                    // setReadTime(post.readTime || '5 phút');
                    setIsFeatured(post.featured || false);
                    setSeoTitle(post.seoTitle || '');
                    setSeoDesc(post.seoDescription || post.seoDesc || ''); // Handle both naming conventions if any
                    setMainKeyword(post.mainKeyword || '');
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    // Handle Title Change & Slug Gen
    const handleTitleChange = (val: string) => {
        setTitle(val);
        if (!id && !isEditingSlug) {
            manualGenerateSlug(val);
        }
    };

    const manualGenerateSlug = (val: string) => {
        const newSlug = val.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
        setSlug(newSlug);
    };

    const checkSlugUnique = async (slugToCheck: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/blog/check-slug`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: slugToCheck })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.exists) {
                    const uniqueSlug = `${slugToCheck}-${Date.now().toString().slice(-4)}`;
                    setSlug(uniqueSlug);
                }
            }
        } catch (e) {
            console.error("Slug check failed", e);
        }
    };

    // Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);
            try {
                const res = await fetch(`${BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.url) setImage(data.url);
            } catch (error) {
                console.error("Upload failed", error);
            }
        }
    };

    const handleSelectFromLibrary = (img: string) => {
        setImage(img);
        setShowMediaLibrary(false);
    };

    const generateSeoFromContent = () => {
        if (!seoTitle) setSeoTitle(title.slice(0, 70));
        if (!seoDesc) setSeoDesc(excerpt.slice(0, 320) || title);
    };

    const handleSave = async () => {
        if (!title) { alert('Vui lòng nhập tiêu đề'); return; }
        setIsSubmitting(true);

        const postData = {
            title, slug, excerpt, content, categoryId, tags, author, image,
            // readTime, // Removed
            featured: isFeatured, seoTitle, seoDesc, mainKeyword
        };

        try {
            const url = id ? `${BACKEND_URL}/api/blog/${id}` : `${BACKEND_URL}/api/blog`;
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                alert(id ? 'Cập nhật thành công' : 'Đăng bài thành công');
                router.push('/admin/blog');
            } else {
                alert('Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Save error', error);
            alert('Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Memoize editor config to prevent re-creation
    const editorConfig = React.useMemo(() => ({
        uploadUrl: `${BACKEND_URL}/api/upload`,
        mediaLibraryUrl: `${BACKEND_URL}/api/media`,
    }), []);

    return (
        <div className="space-y-6 max-w-full mx-auto pb-20 relative">

            {/* Media Library Modal */}
            {showMediaLibrary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10">
                            <div>
                                <h3 className="font-bold text-lg">Thư viện hình ảnh</h3>
                                <p className="text-xs text-gray-500">Chọn ảnh đại diện cho bài viết</p>
                            </div>
                            <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all bg-white"
                                >
                                    <Upload className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Tải lên</span>
                                </button>
                                {libraryImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectFromLibrary(img)}
                                        className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 hover:ring-2 hover:ring-emerald-200 transition-all relative group"
                                    >
                                        <AgriImage src={img} alt="" className="w-full h-full object-cover" />
                                        {image === img && (
                                            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-20 py-4 -mx-8 px-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{id ? 'Sửa bài viết' : 'Viết bài mới'}</h1>
                        <p className="text-xs text-gray-500">Chia sẻ kiến thức hữu ích đến khách hàng</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Lưu nháp</button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className={`px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold flex items-center gap-2 shadow-sm text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? 'Đang lưu...' : (id ? 'Cập nhật' : 'Đăng bài')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Content) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title & Slug */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài viết</label>
                            <input
                                type="text"
                                placeholder="Nhập tiêu đề hấp dẫn..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-medium"
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                            />
                        </div>

                        {/* Permalink */}
                        <div>
                            <div className="flex items-center gap-1 text-sm mt-3">
                                <span className="text-gray-500 select-none">https://agrimart.vn/blog/</span>
                                <div className="relative flex-grow group">
                                    {isEditingSlug ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                autoFocus
                                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-gray-900 font-medium"
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                onBlur={(e) => {
                                                    checkSlugUnique(e.target.value);
                                                    setIsEditingSlug(false);
                                                }}
                                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingSlug(false)}
                                            />
                                            <button onClick={() => setIsEditingSlug(false)} className="text-emerald-600 hover:text-emerald-700 p-1 bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/slug">
                                            <span
                                                onClick={() => setIsEditingSlug(true)}
                                                className="text-gray-900 font-medium cursor-pointer border-b border-dashed border-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                                title="Nhấn để chỉnh sửa"
                                            >
                                                {slug || 'tieu-de-bai-viet'}
                                            </span>
                                            <button onClick={() => setIsEditingSlug(true)} className="opacity-0 group-hover/slug:opacity-100 text-gray-400 hover:text-emerald-600 transition-opacity p-1">
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[500px] overflow-hidden">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                                <p>Đang tải nội dung bài viết...</p>
                            </div>
                        ) : (
                            <Editor
                                initialContent={content}
                                onContentChange={(data) => setContent(data.html)}
                                config={editorConfig}
                            />
                        )}
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn (Excerpt)</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            placeholder="Tóm tắt nội dung bài viết (hiển thị ở danh sách bài viết)..."
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2 text-right">{excerpt.length}/300 ký tự</p>
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-gray-500" /> Tối ưu SEO
                            </h3>
                            <button
                                onClick={generateSeoFromContent}
                                className="text-xs text-emerald-600 font-medium hover:underline bg-emerald-50 px-2 py-1 rounded"
                            >
                                Tự động điền
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                                <p className="text-sm text-blue-800 font-medium truncate hover:underline cursor-pointer">
                                    {seoTitle || title || 'Tiêu đề trang hiển thị trên Google'}
                                </p>
                                <p className="text-xs text-green-700 truncate">
                                    https://agrimart.vn/blog/{slug || 'duong-dan-bai-viet'}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {seoDesc || excerpt || 'Mô tả trang hiển thị trên kết quả tìm kiếm Google...'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa chính</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={mainKeyword}
                                    onChange={(e) => setMainKeyword(e.target.value)}
                                    placeholder="VD: cách trồng cà chua, chăm sóc lan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề trang (Meta Title)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    placeholder={title}
                                />
                                <span className="text-xs text-gray-400 mt-1 block">{seoTitle.length}/70 ký tự</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tìm kiếm (Meta Description)</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                    value={seoDesc}
                                    onChange={(e) => setSeoDesc(e.target.value)}
                                    placeholder={excerpt}
                                />
                                <span className="text-xs text-gray-400 mt-1 block">{seoDesc.length}/320 ký tự</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Settings) */}
                <div className="space-y-6">

                    {/* Publish Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Đăng bài</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="published">Công khai</option>
                                    <option value="draft">Bản nháp</option>
                                    <option value="hidden">Ẩn</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                        checked={isFeatured}
                                        onChange={(e) => setIsFeatured(e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-emerald-700 transition-colors">Bài viết nổi bật</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                        checked={allowComments}
                                        onChange={(e) => setAllowComments(e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-emerald-700 transition-colors">Cho phép bình luận</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Phân loại</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(c => {
                                        if (isEditingCategory && editingCategoryId === c.id) {
                                            return (
                                                <div key={c.id} className="flex items-center gap-1 bg-white border border-emerald-500 rounded-lg px-2 py-1 shadow-sm">
                                                    <input
                                                        type="text"
                                                        className="w-32 text-sm outline-none bg-transparent"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveCategory();
                                                            if (e.key === 'Escape') { setIsEditingCategory(false); setEditingCategoryId(null); }
                                                        }}
                                                    />
                                                    <button onClick={handleSaveCategory} className="text-emerald-600 hover:bg-emerald-50 p-0.5 rounded"><Check className="w-3 h-3" /></button>
                                                    <button onClick={() => { setIsEditingCategory(false); setEditingCategoryId(null); }} className="text-red-500 hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
                                                </div>
                                            );
                                        }
                                        const isSelected = categoryId === c.id;
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => !isEditingCategory && setCategoryId(c.id)}
                                                className={`px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all flex items-center gap-2 group ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-gray-50'}`}
                                            >
                                                {c.name}
                                                {isSelected && !isEditingCategory && (
                                                    <div className="flex items-center gap-1 pl-2 border-l border-emerald-200/50">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); startEditCategory(); }}
                                                            className="p-1 hover:bg-emerald-100 rounded text-emerald-600/70 hover:text-emerald-700"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(); }}
                                                            className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Add New Button/Input */}
                                    {isCreatingCategory ? (
                                        <div className="flex items-center gap-1 bg-white border border-emerald-500 rounded-lg px-2 py-1 shadow-sm animate-in fade-in zoom-in duration-200">
                                            <input
                                                type="text"
                                                className="w-32 text-sm outline-none bg-transparent"
                                                placeholder="Tên danh mục..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveCategory();
                                                    if (e.key === 'Escape') setIsCreatingCategory(false);
                                                }}
                                            />
                                            <button onClick={handleSaveCategory} className="text-emerald-600 hover:bg-emerald-50 p-0.5 rounded"><Check className="w-3 h-3" /></button>
                                            <button onClick={() => setIsCreatingCategory(false)} className="text-red-500 hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setIsCreatingCategory(true); setNewCategoryName(''); }}
                                            className="px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Thêm
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thẻ (Tags)</label>
                                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                                    <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                                    {tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in duration-200">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-emerald-900 rounded-full p-0.5 hover:bg-emerald-200/50">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        className="bg-transparent outline-none text-sm min-w-[80px] flex-1"
                                        placeholder={tags.length === 0 ? "Nhập tag và nhấn Enter..." : ""}
                                        value={tagInput}
                                        onChange={handleTagChange}
                                        onKeyDown={handleTagKeyDown}
                                        onBlur={() => handleAddTag(tagInput)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Phân cách thẻ bằng dấu phẩy (,)</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image - Updated */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Ảnh đại diện</h3>

                        <div className="space-y-3">
                            {/* Preview Area */}
                            <div
                                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group bg-gray-50"
                                onClick={() => !image && fileInputRef.current?.click()}
                            >
                                {image ? (
                                    <>
                                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:text-emerald-600 flex items-center gap-2"
                                            >
                                                <Upload className="w-3.5 h-3.5" /> Tải ảnh mới
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowMediaLibrary(true); }}
                                                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:text-emerald-600 flex items-center gap-2"
                                            >
                                                <FolderOpen className="w-3.5 h-3.5" /> Chọn từ thư viện
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">Kéo thả hoặc nhấn để tải lên</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {/* Action Buttons if no image */}
                            {!image && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        <Upload className="w-4 h-4" /> Tải lên
                                    </button>
                                    <button
                                        onClick={() => setShowMediaLibrary(true)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        <FolderOpen className="w-4 h-4" /> Thư viện
                                    </button>
                                </div>
                            )}

                            {image && (
                                <button
                                    onClick={() => setImage('')}
                                    className="w-full py-2 text-red-500 text-xs font-medium flex items-center justify-center gap-1 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                >
                                    <X className="w-3 h-3" /> Xóa ảnh
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
