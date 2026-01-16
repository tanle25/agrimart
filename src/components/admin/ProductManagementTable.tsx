"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Edit,
    Trash2,
    ChevronDown,
    Box,
    Edit2,
    X,
    Check,
    ArrowDown,
    AlertCircle,
    CheckCircle2,
    XCircle,
    CornerDownRight,
    MoreHorizontal,
    Zap
} from 'lucide-react';
import { Product } from '@/shared/types';
import { AgriImage } from '@/components/ui/AgriImage';

interface ProductManagementTableProps {
    products: Product[];
    onUpdate: (updatedProduct: Product) => void;
    onDelete?: (id: string | number) => void;
}

export const ProductManagementTable: React.FC<ProductManagementTableProps> = ({ products, onUpdate, onDelete }) => {
    const [expandedProductIds, setExpandedProductIds] = useState<Set<string | number>>(new Set());

    // --- Smart Editing State ---
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editSimpleData, setEditSimpleData] = useState({ price: 0, comparePrice: 0, stock: 0 });
    const [editVariantsData, setEditVariantsData] = useState<Record<string, { price: number; comparePrice: number; stock: number }>>({});
    const [bulkUpdateData, setBulkUpdateData] = useState({ price: '', comparePrice: '', stock: '' });

    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [editingId]);

    const toggleExpand = (id: string | number) => {
        const newSet = new Set(expandedProductIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedProductIds(newSet);
    };

    // --- Logic Helpers ---
    const getStockStatus = (stock: number) => {
        if (stock <= 0) return { label: 'Hết hàng', color: 'bg-red-50 text-red-600 border-red-100', icon: XCircle };
        if (stock < 10) return { label: 'Sắp hết', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: AlertCircle };
        return { label: 'Còn hàng', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
    };

    const startEditSimple = (product: Product) => {
        setEditingId(product.id);
        setEditSimpleData({ price: product.price, comparePrice: product.oldPrice || 0, stock: product.stock || 0 });
        setEditVariantsData({});
    };

    const saveEditSimple = (product: Product) => {
        onUpdate({ ...product, price: editSimpleData.price, oldPrice: editSimpleData.comparePrice, stock: editSimpleData.stock });
        setEditingId(null);
    };

    const startEditVariable = (product: Product) => {
        setEditingId(product.id);
        if (!expandedProductIds.has(product.id)) {
            const newSet = new Set(expandedProductIds);
            newSet.add(product.id);
            setExpandedProductIds(newSet);
        }
        const initialData: Record<string, any> = {};
        product.variants?.forEach(v => {
            initialData[v.id] = { price: v.price, comparePrice: v.salePrice || 0, stock: v.stock || 0 };
        });
        setEditVariantsData(initialData);
        setBulkUpdateData({ price: '', comparePrice: '', stock: '' });
    };

    const handleVariantChange = (variantId: string, field: 'price' | 'comparePrice' | 'stock', value: number) => {
        setEditVariantsData(prev => ({ ...prev, [variantId]: { ...prev[variantId], [field]: value } }));
    };

    const handleBulkApply = () => {
        setEditVariantsData(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                if (bulkUpdateData.price !== '') next[key].price = Number(bulkUpdateData.price);
                if (bulkUpdateData.comparePrice !== '') next[key].comparePrice = Number(bulkUpdateData.comparePrice);
                if (bulkUpdateData.stock !== '') next[key].stock = Number(bulkUpdateData.stock);
            });
            return next;
        });
    };

    const saveEditVariable = (product: Product) => {
        if (!product.variants) return;
        const updatedVariants = product.variants.map(v => {
            const newData = editVariantsData[v.id];
            return newData ? { ...v, price: newData.price, salePrice: newData.comparePrice, stock: newData.stock } : v;
        });
        onUpdate({ ...product, variants: updatedVariants });
        setEditingId(null);
        setEditVariantsData({});
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditVariantsData({});
    };

    const getPriceRange = (product: Product) => {
        if (!product.variants || product.variants.length === 0) return '0đ';
        const prices = product.variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `${min.toLocaleString()}đ` : `${min.toLocaleString()} - ${max.toLocaleString()}đ`;
    };

    const getOldPriceRange = (product: Product) => {
        if (!product.variants || product.variants.length === 0) return null;
        const prices = product.variants.map(v => v.salePrice).filter((p): p is number => !!p && p > 0);
        if (prices.length === 0) return null;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `${min.toLocaleString()}đ` : `${min.toLocaleString()} - ${max.toLocaleString()}đ`;
    };

    const getTotalStock = (product: Product) => product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap table-fixed">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="w-14 px-4 py-4 text-center">#</th>
                            <th className="px-4 py-4">Sản phẩm</th>
                            <th className="w-40 px-4 py-4 text-right">Giá bán</th>
                            <th className="w-40 px-4 py-4 text-right">Giá gốc</th>
                            <th className="w-32 px-4 py-4 text-center">Tồn kho</th>
                            <th className="w-28 px-4 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => {
                            const isExpanded = expandedProductIds.has(product.id);
                            const isVariable = product.type === 'variable';
                            const isEditing = editingId === product.id;
                            const stock = isVariable ? getTotalStock(product) : (product.stock || 0);
                            const stockInfo = getStockStatus(stock);
                            const StatusIcon = stockInfo.icon;
                            const oldPriceRange = isVariable ? getOldPriceRange(product) : null;

                            return (
                                <React.Fragment key={product.id}>
                                    {/* MAIN PRODUCT ROW */}
                                    <tr className={`group transition-all hover:bg-gray-50/50 ${isEditing ? 'bg-emerald-50/20' : ''}`}>
                                        <td className="px-4 py-4 text-center align-top pt-6">
                                            {isVariable ? (
                                                <button
                                                    onClick={() => toggleExpand(product.id)}
                                                    className={`
                                        w-6 h-6 flex items-center justify-center rounded-md transition-all duration-200 mx-auto
                                        ${isExpanded ? 'bg-emerald-100 text-emerald-600 rotate-180' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                                      `}
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-gray-300 text-xs">SP{product.id}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="relative group/img flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                        <AgriImage src={product.image || product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/admin/san-pham/${product.id}`}
                                                        className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-sm line-clamp-2"
                                                        title={product.name}
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wide">
                                                            {product.category}
                                                        </span>
                                                        {product.status === 'draft' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Nháp</span>}
                                                        {isVariable && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{product.variants?.length} biến thể</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SIMPLE PRODUCT EDITING */}
                                        {isEditing && !isVariable ? (
                                            <>
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        ref={firstInputRef}
                                                        type="number"
                                                        className="w-full px-2 py-1.5 bg-white border border-emerald-400 rounded text-sm text-right font-medium text-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none"
                                                        value={editSimpleData.price}
                                                        onChange={(e) => setEditSimpleData({ ...editSimpleData, price: Number(e.target.value) })}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEditSimple(product)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        type="number"
                                                        className="w-full px-2 py-1.5 bg-white border border-emerald-400 rounded text-sm text-right text-gray-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                                                        value={editSimpleData.comparePrice}
                                                        onChange={(e) => setEditSimpleData({ ...editSimpleData, comparePrice: Number(e.target.value) })}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEditSimple(product)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <input
                                                        type="number"
                                                        className="w-20 px-2 py-1.5 bg-white border border-emerald-400 rounded text-sm text-center font-medium text-gray-800 focus:ring-2 focus:ring-emerald-100 outline-none mx-auto block"
                                                        value={editSimpleData.stock}
                                                        onChange={(e) => setEditSimpleData({ ...editSimpleData, stock: Number(e.target.value) })}
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEditSimple(product)}
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            // VIEW MODE
                                            <>
                                                <td className="px-4 py-4 text-right align-top">
                                                    {isVariable ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-bold text-gray-900">{getPriceRange(product)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-900">{product.price.toLocaleString()}đ</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right align-top">
                                                    {isVariable ? (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {oldPriceRange || '--'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {product.oldPrice ? `${product.oldPrice.toLocaleString()}đ` : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center align-top">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${stockInfo.color}`}>
                                                        {stock}
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        <td className="px-4 py-4 text-right align-top">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => isVariable ? saveEditVariable(product) : saveEditSimple(product)} className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm transition-all" title="Lưu"><Check className="w-3.5 h-3.5" /></button>
                                                        <button onClick={cancelEdit} className="p-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:bg-gray-50 hover:text-red-500 shadow-sm transition-all" title="Hủy"><X className="w-3.5 h-3.5" /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => isVariable ? startEditVariable(product) : startEditSimple(product)}
                                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                                                            title="Sửa nhanh"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="relative group/more">
                                                            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-all">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                            {/* Dropdown Menu */}
                                                            <div className="absolute right-0 top-full w-36 pt-1 hidden group-hover/more:block z-20">
                                                                <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200">
                                                                    <Link href={`/san-pham/${product.slug || product.id}`} className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left w-full">Xem trang sản phẩm</Link>
                                                                    <Link href={`/admin/san-pham/${product.id}`} className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left w-full">Chỉnh sửa chi tiết</Link>
                                                                    <button onClick={() => onDelete && onDelete(product.id)} className="block px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left w-full">Xóa sản phẩm</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* EXPANDED VARIANT ROWS (Tree View Layout) */}
                                    {isVariable && isExpanded && (
                                        <tr className="animate-in fade-in slide-in-from-top-1 duration-200">
                                            <td colSpan={6} className="p-0 border-none relative">
                                                <div className="bg-gray-50 border-y border-gray-100">

                                                    {/* BULK EDIT TOOLBAR (RIGHT ALIGNED) */}
                                                    {isEditing && (
                                                        <div className="py-2 px-4 flex items-center justify-end border-b border-gray-100">
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-2">
                                                                    <Zap className="w-3 h-3 text-emerald-500 fill-current" /> Điền nhanh:
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Giá bán..."
                                                                        className="w-28 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none text-right font-medium text-emerald-700 placeholder-emerald-700/30 transition-all"
                                                                        value={bulkUpdateData.price}
                                                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, price: e.target.value })}
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Giá gốc..."
                                                                        className="w-28 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none text-right text-gray-600 placeholder-gray-400 transition-all"
                                                                        value={bulkUpdateData.comparePrice}
                                                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, comparePrice: e.target.value })}
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Kho..."
                                                                        className="w-20 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none text-center font-medium text-gray-800 placeholder-gray-400 transition-all"
                                                                        value={bulkUpdateData.stock}
                                                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, stock: e.target.value })}
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={handleBulkApply}
                                                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 shadow-sm transition-all ml-1"
                                                                >
                                                                    Áp dụng
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* VARIANTS LIST */}
                                                    <div className="divide-y divide-gray-100">
                                                        {product.variants?.map((variant, index) => {
                                                            const variantData = editVariantsData[variant.id];
                                                            const vStockInfo = getStockStatus(variant.stock || 0);

                                                            return (
                                                                <div key={variant.id} className="flex items-center hover:bg-white transition-colors group/variant">
                                                                    {/* Tree Branch Icon Container - Aligned with the '#' column (w-14) */}
                                                                    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                                                                        <CornerDownRight className="w-4 h-4 text-gray-300" />
                                                                    </div>

                                                                    {/* Variant Info */}
                                                                    <div className="flex-1 py-3 pr-4 flex items-center">
                                                                        {/* Name & SKU */}
                                                                        <div className="flex-1 min-w-0 flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-300 overflow-hidden">
                                                                                {variant.image ? (
                                                                                    <AgriImage src={variant.image} alt="" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <Box className="w-3.5 h-3.5" />
                                                                                )}
                                                                            </div>
                                                                            <div className="truncate">
                                                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                                                    {variant.name || Object.values(variant.attributes || {}).join(' - ')}
                                                                                </div>
                                                                                <div className="text-[10px] text-gray-400 font-mono">{variant.sku || variant.id}</div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Data Columns - Fixed Widths matching Parent Header */}
                                                                        <div className="w-40 px-4 text-right flex-shrink-0">
                                                                            {isEditing && variantData ? (
                                                                                <input type="number" className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs text-right focus:ring-1 focus:ring-emerald-200 outline-none font-medium text-emerald-700" value={variantData.price} onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))} />
                                                                            ) : (
                                                                                <span className="text-sm text-gray-700">{variant.price.toLocaleString()}đ</span>
                                                                            )}
                                                                        </div>

                                                                        <div className="w-40 px-4 text-right flex-shrink-0">
                                                                            {isEditing && variantData ? (
                                                                                <input type="number" className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs text-right focus:ring-1 focus:ring-emerald-200 outline-none text-gray-600" value={variantData.comparePrice} onChange={(e) => handleVariantChange(variant.id, 'comparePrice', Number(e.target.value))} />
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400 line-through">{variant.salePrice ? `${variant.salePrice.toLocaleString()}đ` : '-'}</span>
                                                                            )}
                                                                        </div>

                                                                        <div className="w-32 px-4 text-center flex-shrink-0">
                                                                            {isEditing && variantData ? (
                                                                                <input type="number" className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded text-xs text-center focus:ring-1 focus:ring-emerald-200 outline-none mx-auto block font-bold text-gray-800" value={variantData.stock} onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))} />
                                                                            ) : (
                                                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${vStockInfo.color} bg-opacity-50`}>{variant.stock || 0}</span>
                                                                            )}
                                                                        </div>

                                                                        {/* Spacer for Action Column alignment */}
                                                                        <div className="w-28 px-4 flex-shrink-0"></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
