"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { ProductManagementTable } from '@/components/admin/ProductManagementTable';
import { Product } from '@/shared/types';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ProductListPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/products?limit=1000`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || (Array.isArray(data) ? data : []));
            } else {
                console.error("Failed to fetch products");
                // Fallback or empty
            }
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductUpdate = async (updatedProduct: Product) => {
        try {
            // Optimistic update
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

            const res = await fetch(`${BACKEND_URL}/api/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });

            if (!res.ok) {
                // Revert if failed (fetch original to be safe or just alert)
                console.error("Update failed");
                alert("Cập nhật thất bại, vui lòng tải lại trang.");
                fetchProducts();
            }
        } catch (error) {
            console.error("Error updating product", error);
            fetchProducts();
        }
    };

    const handleProductDelete = async (id: string | number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert('Xóa thất bại');
            }
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra');
        }
    };

    // Filter Logic
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-6 pb-20">
            <style>{`
        /* Hide number input arrows */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-gray-50 z-10 py-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-gray-500 text-sm">Quản lý kho hàng và chỉnh sửa nhanh thông tin.</p>
                </div>
                <Link
                    href="/admin/san-pham/them"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, SKU, danh mục..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors w-full sm:w-auto justify-center">
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <ProductManagementTable
                    products={currentProducts}
                    onUpdate={handleProductUpdate}
                    onDelete={handleProductDelete}
                />
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm
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
