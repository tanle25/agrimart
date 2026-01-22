"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Globe, Calendar, User, Eye } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    author: string;
    categoryId?: number;
    category?: BlogCategory;
    date: string;
    image: string;
    featured: boolean;
}

export default function BlogManagerPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchPosts = async () => {
        try {
            console.log('Fetching posts from:', BACKEND_URL);
            const res = await fetch(`${BACKEND_URL}/api/blog?limit=1000`);
            console.log('Response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched data:', data);
                // Handle both array (legacy) and object with items (pagination)
                if (Array.isArray(data)) {
                    setPosts(data);
                } else if (data.items && Array.isArray(data.items)) {
                    setPosts(data.items);
                } else {
                    console.warn('Unexpected data format:', data);
                    setPosts([]);
                }
            } else {
                console.error('Fetch failed with status:', res.status);
            }
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/blog/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
            } else {
                alert('Xóa thất bại');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra');
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(posts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bài viết</h1>
                    <p className="text-gray-500 text-sm">Chia sẻ kiến thức và tin tức đến khách hàng.</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Viết bài mới
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bài viết</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tác giả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đăng</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {posts.length === 0 ? 'Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!' : 'Không tìm thấy bài viết nào'}
                                    </td>
                                </tr>
                            ) : (
                                currentPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {post.image ? (
                                                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                                            <Globe className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1 max-w-[300px]" title={post.title}>
                                                        {post.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                        <a href={`https://agrimart.vn/tin-tuc/${post.slug}`} target="_blank" rel="noreferrer" className="hover:text-emerald-600 hover:underline">
                                                            /tin-tuc/{post.slug}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                {post.author}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium border border-emerald-100">
                                                {post.category?.name || 'Không có danh mục'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {post.date || 'Chưa có ngày'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/tin-tuc/${post.slug}`}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Xem trang bài viết"
                                                    target="_blank"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/blog/edit/${post.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
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
                </div>
            </div>

            {/* Pagination */}
            {posts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, posts.length)} trong tổng số {posts.length} bài viết
                    </span>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-600 font-medium transition-colors"
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-600 px-2">
                            Trang {currentPage}/{totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-600 font-medium transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
