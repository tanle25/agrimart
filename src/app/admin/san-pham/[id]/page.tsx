'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductEditor from '@/components/admin/ProductEditor';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                } else {
                    alert('Không tìm thấy sản phẩm');
                    router.push('/admin/san-pham');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                alert('Có lỗi xảy ra');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-[1400px] mx-auto p-6">
            <div className="mb-6">
                <Link href="/admin/san-pham" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-2">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
                </Link>
            </div>
            <ProductEditor initialProduct={product} />
        </div>
    );
}
