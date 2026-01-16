"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Attribute, Variant } from '../../shared/types';
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  X,
  Upload,
  Box,
  Truck,
  Globe,
  Tag,
  AlertCircle,
  FolderOpen,
  Edit2,
  Check,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  AlignLeft,

  Type,
  Move,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AgriImage } from '@/components/ui/AgriImage';
import { useToast } from '@/contexts/ToastContext';
import dynamic from 'next/dynamic';

const Editor = dynamic(
  () => import('@/components/editor/Editor').then((mod) => ({ default: mod.Editor })),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Editor...</div> }
);

// Default mock data for UI initialization
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Category {
  id: number;
  name: string;
  slug: string;
}


const MOCK_LIBRARY_IMAGES = [
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
  'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=200',
  'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200',
  'https://images.unsplash.com/photo-1543528176-61b239494933?w=200',
  'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=200',
  'https://images.unsplash.com/photo-1622206151226-18ca2c958a2f?w=200',
];

interface ExtendedAttribute extends Attribute {
  isVisual: boolean;
  valueImages: Record<string, string>;
}

interface ProductEditorProps {
  initialProduct?: any;
}

// Price Input Component
interface PriceInputProps {
  value: number | undefined | null;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

const PriceInput: React.FC<PriceInputProps> = ({ value, onChange, className, placeholder }) => {
  const format = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = rawValue === '' ? 0 : Number(rawValue);
    onChange(numValue);
  };

  return (
    <input
      type="text"
      className={className}
      placeholder={placeholder}
      value={format(value)}
      onChange={handleChange}
    />
  );
};

export default function ProductEditor({ initialProduct }: ProductEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'main' | { attrIndex: number, val: string } | null>(null);
  const [librarySelection, setLibrarySelection] = useState<string[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/product-categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error("Failed to fetch product categories", e);
      }
    };
    fetchCategories();
  }, []);

  // New Effect: Fetch library images when dialog opens
  useEffect(() => {
    if (showMediaLibrary) {
      const fetchLibrary = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/media`);
          if (res.ok) {
            const data = await res.json();
            setLibraryImages(data.items || []);
          }
        } catch (e) {
          console.error("Failed to load library images", e);
        }
      }
      fetchLibrary();
    }
  }, [showMediaLibrary]);

  // --- General Info ---
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
  const [name, setName] = useState('');

  // Slug state
  const [slug, setSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const [description, setDescription] = useState(''); // Short description
  const [content, setContent] = useState(''); // Detailed Content (Rich Text)

  // --- Sidebar Info ---
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Pricing & Inventory ---
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [stock, setStock] = useState<number>(100);

  // --- Shipping ---
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ l: '', w: '', h: '' });

  // --- SEO ---
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');

  const generateSeoFromContent = () => {
    if (!seoTitle) setSeoTitle(name.slice(0, 70));
    if (!seoDesc) setSeoDesc(description.slice(0, 320) || name);
  };

  // --- Attributes & Variants ---
  const [attributes, setAttributes] = useState<ExtendedAttribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  // --- Bulk Edit State ---
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSalePrice, setBulkSalePrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    if (initialProduct && !initialLoaded) {
      setName(initialProduct.name || '');
      setSlug(initialProduct.slug || '');
      setDescription(initialProduct.description || '');
      setContent(initialProduct.content || '');
      setCategory(initialProduct.category || '');
      setVendor(initialProduct.vendor || '');
      setTags(initialProduct.tags || []);
      setImages(initialProduct.images || []);
      setProductType(initialProduct.type || 'simple');

      // Price Logic
      if (initialProduct.oldPrice && initialProduct.oldPrice > initialProduct.price) {
        setPrice(initialProduct.oldPrice);
        setSalePrice(initialProduct.price);
      } else {
        setPrice(initialProduct.price || 0);
        setSalePrice(0);
      }

      setSku(initialProduct.sku || '');
      setBarcode(initialProduct.barcode || '');
      setStock(initialProduct.stock || 0);
      setWeight(initialProduct.weight || '');
      if (initialProduct.dimensions) {
        const dims = initialProduct.dimensions as any;
        setDimensions({ l: dims.length || '', w: dims.width || '', h: dims.height || '' });
      }
      setSeoTitle(initialProduct.seoTitle || '');
      setSeoDesc(initialProduct.seoDescription || '');
      setMainKeyword(initialProduct.mainKeyword || '');

      if (initialProduct.type === 'variable') {
        // Ensure attributes are cast to ExtendedAttribute format (might be missing isVisual/valueImages from DB if not persisted fully)
        const loadedAttrs = (initialProduct.attributes || []).map((a: any) => ({
          ...a,
          isVisual: a.isVisual || false,
          valueImages: a.valueImages || {}
        }));
        setAttributes(loadedAttrs);
        if (initialProduct.variants) setVariants(initialProduct.variants);
      }
      setInitialLoaded(true);
    }
  }, [initialProduct, initialLoaded]);


  // --- Handlers ---

  /* Check slug uniqueness */
  const checkSlugUnique = async (slugToCheck: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/check-slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slugToCheck })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          // If exists, maybe append a suffix or valid? 
          // For now, let's just warn or append a random ID
          const uniqueSlug = `${slugToCheck}-${Date.now().toString().slice(-4)}`;
          setSlug(uniqueSlug);
        }
      }
    } catch (e) {
      console.error("Slug check failed", e);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditingSlug && !initialProduct?.id) { // Only auto-gen if creating new or explicitly allowed
      manualGenerateSlug(val);
    }
  };

  const manualGenerateSlug = (val: string) => {
    const newSlug = val.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "") // Allow existing hyphens
      .trim()
      .replace(/\s+/g, "-");
    setSlug(newSlug);
    // Debounce check unique? For now let's check on blur or just let it be. 
    // Ideally we check before submit or debounced.
  };

  // Add a cleanup/debounce for checking uniqueness?
  // Let's check uniqueness when the user *finishes* typing or on blur of the slug field. 
  // For auto-generated, we can check "on completion" but it's hard to know when.
  // Let's simply add an onBlur to the slug input to check uniqueness.

  const generateSlug = (val: string) => {
    manualGenerateSlug(val);
  };

  const handleSubmit = async () => {
    if (!name) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
    if (price < 0) { toast.error('Giá bán không được nhỏ hơn 0'); return; }
    if (stock < 0) { toast.error('Số lượng tồn kho không được nhỏ hơn 0'); return; }

    setIsSubmitting(true);

    // Logic: If salePrice > 0, then real price = salePrice, oldPrice = user entered Price.
    const finalPrice = (salePrice > 0 && salePrice < price) ? salePrice : price;
    const finalOldPrice = (salePrice > 0 && salePrice < price) ? price : null;

    const productData = {
      name,
      slug,
      description,
      content,
      category,
      vendor,
      tags,
      images,
      type: productType,
      price: finalPrice,
      oldPrice: finalOldPrice,
      sku,
      barcode,
      stock,
      width: dimensions.w,
      height: dimensions.h,
      length: dimensions.l,
      weight,
      seoTitle,
      seoDescription: seoDesc,
      mainKeyword,
      attributes: productType === 'variable' ? attributes : [],
      variants: productType === 'variable' ? variants : [],
      status: 'active'
    };

    try {
      const url = initialProduct?.id ? `${BACKEND_URL}/api/products/${initialProduct.id}` : `${BACKEND_URL}/api/products`;
      const method = initialProduct?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      if (res.ok) {
        toast.success(initialProduct?.id ? 'Cập nhật thành công' : 'Đăng bán thành công!');
        router.push('/admin/san-pham');
      }
      else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Tag Logic ---
  // --- Tag Logic ---
  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      return true; // Added
    }
    return false; // Not added
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (addTag(e.currentTarget.value)) {
        e.currentTarget.value = '';
      }
    }
  };

  const handleTagBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (addTag(e.currentTarget.value)) {
      e.currentTarget.value = '';
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  // --- Attribute Logic ---

  const addAttribute = () => {
    if (attributes.length >= 2) return;
    setAttributes([...attributes, { name: '', values: [], isVisual: false, valueImages: {} }]);
  };

  const removeAttribute = (index: number) => {
    const newAttrs = attributes.filter((_, i) => i !== index);
    setAttributes(newAttrs);
    regenerateVariants(newAttrs);
  };

  const updateAttributeName = (index: number, newName: string) => {
    const newAttrs = [...attributes];
    newAttrs[index].name = newName;
    setAttributes(newAttrs);
  };

  const setVisualAttribute = (index: number) => {
    const newAttrs = attributes.map((attr, i) => ({
      ...attr,
      isVisual: i === index ? !attr.isVisual : false
    }));
    setAttributes(newAttrs);
    regenerateVariants(newAttrs);
  };

  // Chip Input Logic
  const addAttributeValue = (index: number, val: string) => {
    const trimmed = val.trim();
    if (trimmed) {
      const newAttrs = [...attributes];
      if (!newAttrs[index].values.includes(trimmed)) {
        newAttrs[index].values.push(trimmed);
        setAttributes(newAttrs);
        regenerateVariants(newAttrs);
        return true;
      }
    }
    return false;
  };

  const handleValueKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (addAttributeValue(index, e.currentTarget.value)) {
        e.currentTarget.value = '';
      }
    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && attributes[index].values.length > 0) {
      const newAttrs = [...attributes];
      newAttrs[index].values.pop();
      setAttributes(newAttrs);
      regenerateVariants(newAttrs);
    }
  };

  const handleValueBlur = (index: number, e: React.FocusEvent<HTMLInputElement>) => {
    if (addAttributeValue(index, e.currentTarget.value)) {
      e.currentTarget.value = '';
    }
  };

  const removeAttributeValue = (attrIndex: number, valIndex: number) => {
    const newAttrs = [...attributes];
    const valToRemove = newAttrs[attrIndex].values[valIndex];
    newAttrs[attrIndex].values.splice(valIndex, 1);

    if (newAttrs[attrIndex].valueImages[valToRemove]) {
      delete newAttrs[attrIndex].valueImages[valToRemove];
    }

    setAttributes(newAttrs);
    regenerateVariants(newAttrs);
  };

  // --- Media Library Logic (Multi-select) ---

  const openLibraryForMain = () => {
    setMediaTarget('main');
    setLibrarySelection([]); // Reset selection
    setShowMediaLibrary(true);
  }

  const openLibraryForAttribute = (attrIndex: number, val: string) => {
    setMediaTarget({ attrIndex, val });
    setLibrarySelection([]); // Reset selection
    setShowMediaLibrary(true);
  }

  const toggleImageSelection = (img: string) => {
    if (mediaTarget === 'main') {
      // Multi-select for main images
      if (librarySelection.includes(img)) {
        setLibrarySelection(librarySelection.filter(i => i !== img));
      } else {
        setLibrarySelection([...librarySelection, img]);
      }
    } else {
      // Single-select for attribute (Immediate close)
      confirmAttributeImage(img);
    }
  };

  const confirmLibrarySelection = () => {
    if (mediaTarget === 'main') {
      setImages(prev => [...prev, ...librarySelection]);
    }
    setShowMediaLibrary(false);
    setLibrarySelection([]);
    setMediaTarget(null);
  };

  const confirmAttributeImage = (img: string) => {
    if (mediaTarget && typeof mediaTarget === 'object') {
      const { attrIndex, val } = mediaTarget;
      const newAttrs = [...attributes];
      newAttrs[attrIndex].valueImages[val] = img;
      setAttributes(newAttrs);
      regenerateVariants(newAttrs);
    }
    setShowMediaLibrary(false);
    setMediaTarget(null);
  };

  // Attribute Image Upload (Adapted for Backend)
  const handleAttributeImageUpload = async (attrIndex: number, valueName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      if (e.target.files?.[0]) {
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
          const res = await fetch(`${BACKEND_URL}/api/upload`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.url) {
            const newAttrs = [...attributes];
            newAttrs[attrIndex].valueImages[valueName] = data.url;
            setAttributes(newAttrs);
            regenerateVariants(newAttrs);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    input.click();
  };

  // --- Variant Logic ---

  const regenerateVariants = (currentAttrs: ExtendedAttribute[]) => {
    if (currentAttrs.length === 0 || currentAttrs.some(a => a.values.length === 0)) {
      setVariants([]);
      return;
    }

    const cartesian = (args: string[][]): string[][] => {
      return args.reduce<string[][]>((a, b) => {
        return a.flatMap(d => b.map(e => [d, e].flat()));
      }, [[]]);
    };

    const valueArrays = currentAttrs.map(a => a.values);
    const combinations = cartesian(valueArrays);

    const newVariants: Variant[] = combinations.map((combo, idx) => {
      const variantAttrs: Record<string, string> = {};
      let variantImage = '';

      currentAttrs.forEach((attr, i) => {
        const value = combo[i];
        variantAttrs[attr.name] = value;
        if (attr.isVisual && attr.valueImages[value]) {
          variantImage = attr.valueImages[value];
        }
      });

      const existing = variants[idx];

      return {
        id: existing?.id || `var-${Date.now()}-${idx}`,
        sku: existing?.sku || (sku ? `${sku}-${idx + 1}` : `SKU-${idx + 1}`),
        price: existing?.price || price,
        salePrice: existing?.salePrice || salePrice,
        stock: existing?.stock || 10,
        attributes: variantAttrs,
        image: variantImage
      };
    });

    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVars = [...variants];
    newVars[index] = { ...newVars[index], [field]: value };
    setVariants(newVars);
  };

  const handleBulkUpdate = () => {
    const newVars = variants.map(v => ({
      ...v,
      price: bulkPrice ? Number(bulkPrice) : v.price,
      salePrice: bulkSalePrice ? Number(bulkSalePrice) : v.salePrice,
      stock: bulkStock ? Number(bulkStock) : v.stock,
    }));
    setVariants(newVars);
    setBulkPrice('');
    setBulkSalePrice('');
    setBulkStock('');
  };

  // --- Drag & Drop Upload & Sorting Logic ---

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files) as File[]);
    }
  };

  const processFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${BACKEND_URL}/api/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        return data.url;
      } catch (err) {
        console.error(err);
        return null;
      }
    });

    const newUrls = await Promise.all(uploadPromises);
    setImages(prev => [...prev, ...newUrls.filter(u => u !== null) as string[]]);
  };

  const handleSortDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleSortDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(targetIndex);
  };

  const handleSortDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-6 max-w-full mx-auto pb-20 relative">

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10">
              <div>
                <h3 className="font-bold text-lg">Thư viện hình ảnh</h3>
                <p className="text-xs text-gray-500">
                  {mediaTarget === 'main'
                    ? 'Chọn nhiều ảnh để thêm vào album sản phẩm.'
                    : 'Chọn 1 ảnh cho thuộc tính.'}
                </p>
              </div>
              <button onClick={() => setShowMediaLibrary(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()} // Reuse the hidden file input
                  className="aspect-square border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all bg-white"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Tải lên</span>
                </button>
                {/* Prepend MOCK if needed, or just use fetched libraryImages */}
                {[...libraryImages, ...MOCK_LIBRARY_IMAGES].filter((v, i, a) => a.indexOf(v) === i).map((img, i) => {
                  const isSelected = librarySelection.includes(img);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleImageSelection(img)}
                      className={`
                                        aspect-square rounded-lg overflow-hidden border-2 relative group transition-all
                                        ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300'}
                                    `}
                    >
                      <AgriImage src={img} alt="" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors ${isSelected ? 'bg-emerald-500/10' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer for Multi-select */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {mediaTarget === 'main' ? `${librarySelection.length} ảnh đã chọn` : ''}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setShowMediaLibrary(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">Hủy</button>
                {mediaTarget === 'main' && (
                  <button
                    disabled={librarySelection.length === 0}
                    onClick={confirmLibrarySelection}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thêm {librarySelection.length > 0 ? `(${librarySelection.length})` : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-20 py-4 -mx-8 px-8 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/admin/san-pham" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{initialProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
            <p className="text-xs text-gray-500">Điền thông tin chi tiết để tạo sản phẩm mới</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Lưu nháp</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold flex items-center gap-2 shadow-sm text-sm transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Đang lưu...' : 'Đăng bán'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. General Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              Thông tin chung
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900"
                  placeholder="Ví dụ: Cà chua sạch Đà Lạt"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-500 select-none">https://agrimart.vn/products/</span>
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
                          {slug || 'ten-san-pham-tu-dong'}
                        </span>
                        <button onClick={() => setIsEditingSlug(true)} className="opacity-0 group-hover/slug:opacity-100 text-gray-400 hover:text-emerald-600 transition-opacity p-1">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
                </div>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Mô tả sơ lược hiển thị trên thẻ sản phẩm..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung chi tiết</label>
                <div className="border border-gray-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                  <Editor
                    key={initialLoaded ? 'loaded' : 'initial'}
                    initialContent={content}
                    onContentChange={(data: { html: string }) => setContent(data.html)}
                    config={React.useMemo(() => ({
                      uploadUrl: `${BACKEND_URL}/api/upload`,
                      mediaLibraryUrl: `${BACKEND_URL}/api/media`,
                    }), [])}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Media (Redesigned with Drag & Drop) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Hình ảnh sản phẩm</h2>
              <span className="text-xs text-gray-500">Kéo thả để sắp xếp. Ảnh đầu tiên là ảnh đại diện.</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              className={`
                    border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all cursor-pointer
                    ${isDraggingFile ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 ring-offset-2' : 'border-gray-400 hover:border-emerald-400 hover:bg-gray-50'}
                `}
              onDragOver={handleFileDragOver}
              onDragLeave={handleFileDragLeave}
              onDrop={handleFileDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-600 hover:underline cursor-pointer"
                    >
                      Tải ảnh lên
                    </span>
                    {' '} hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP lên đến 5MB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openLibraryForMain(); }}
                  className="text-xs text-gray-500 hover:text-emerald-600 font-medium flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-lg bg-white hover:border-emerald-200 transition-all mt-2"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Chọn từ thư viện
                </button>
              </div>
            </div>

            {/* Image Sortable Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-top-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`
                                relative aspect-square rounded-lg overflow-hidden border bg-white group cursor-move
                                ${draggedIndex === i ? 'opacity-40 ring-2 ring-emerald-500' : 'border-gray-200 hover:shadow-md'}
                                transition-all duration-200
                            `}
                    draggable
                    onDragStart={(e) => handleSortDragStart(e, i)}
                    onDragEnter={(e) => handleSortDragEnter(e, i)}
                    onDragEnd={handleSortDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <AgriImage src={img} alt="" className="w-full h-full object-cover pointer-events-none select-none" />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-1">
                      <button
                        onClick={() => removeImage(i)}
                        className="bg-white text-red-500 p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all transform hover:scale-105"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Badge for Main Image */}
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 text-white text-[10px] text-center py-1 font-medium backdrop-blur-sm">
                        Ảnh đại diện
                      </span>
                    )}

                    {/* Number indicators for others */}
                    {i > 0 && (
                      <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {i + 1}
                      </span>
                    )}

                    {/* Drag Handle Icon (Visual hint) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <Move className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                ))}
                {/* Add More Button inside grid */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Thêm ảnh</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Data & Variants */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-6 text-gray-900">Dữ liệu sản phẩm</h2>

            <div className="flex gap-4 p-1 bg-gray-100 rounded-lg w-fit mb-6">
              <button
                onClick={() => setProductType('simple')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${productType === 'simple' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Sản phẩm đơn giản
              </button>
              <button
                onClick={() => setProductType('variable')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${productType === 'variable' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Sản phẩm có biến thể
              </button>
            </div>

            {productType === 'simple' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán thường (VNĐ)</label>
                  <PriceInput
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    value={price}
                    onChange={(val) => setPrice(val)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (VNĐ)</label>
                  <PriceInput
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    value={salePrice}
                    onChange={(val) => setSalePrice(val)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã sản phẩm (SKU)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã vạch (Barcode)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Attribute Creator */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">Thuộc tính</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Tối đa 2</span>
                    </div>
                    {attributes.length < 2 && (
                      <button
                        onClick={addAttribute}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Thêm thuộc tính
                      </button>
                    )}
                  </div>

                  {attributes.map((attr, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:border-emerald-200 hover:shadow-sm">
                      <button
                        onClick={() => removeAttribute(idx)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-white p-1 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Attribute Name */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Tên thuộc tính</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-sm focus:border-emerald-500 outline-none"
                            placeholder="VD: Màu sắc"
                            value={attr.name}
                            onChange={(e) => updateAttributeName(idx, e.target.value)}
                          />
                          <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                              checked={attr.isVisual}
                              onChange={() => setVisualAttribute(idx)}
                            />
                            <span className="text-xs text-gray-600">Thêm ảnh cho thuộc tính này</span>
                          </label>
                        </div>

                        {/* Attribute Values (Chip Input) */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Giá trị (Enter hoặc phẩy để thêm)</label>
                          <div className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg text-sm focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 flex flex-wrap gap-2 min-h-[42px]">
                            {attr.values.map((val, vIdx) => (
                              <span key={vIdx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium shadow-sm">
                                {val}
                                <button onClick={() => removeAttributeValue(idx, vIdx)} className="hover:text-red-500 focus:outline-none p-0.5 rounded-full hover:bg-emerald-100 transition-colors"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                            <input
                              type="text"
                              className="flex-grow outline-none bg-transparent min-w-[120px]"
                              placeholder={attr.values.length === 0 ? "VD: Đỏ, Xanh, Vàng" : ""}
                              onKeyDown={(e) => handleValueKeyDown(idx, e)}
                              onBlur={(e) => handleValueBlur(idx, e)}
                            />
                          </div>

                          {/* Image Uploader for Visual Attribute */}
                          {attr.isVisual && attr.values.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                              {attr.values.map((val, vIdx) => (
                                <div key={vIdx} className="text-center">
                                  <div className="aspect-square rounded-lg border border-dashed border-gray-400 hover:border-emerald-400 bg-white flex items-center justify-center relative overflow-hidden group/img">
                                    {attr.valueImages[val] ? (
                                      <AgriImage src={attr.valueImages[val]} alt={val} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-gray-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity gap-2">
                                      <button onClick={() => handleAttributeImageUpload(idx, val)} className="p-1.5 bg-white rounded-full text-gray-700 hover:text-emerald-600" title="Tải lên"><Upload className="w-4 h-4" /></button>
                                      <button onClick={() => openLibraryForAttribute(idx, val)} className="p-1.5 bg-white rounded-full text-gray-700 hover:text-emerald-600" title="Thư viện"><FolderOpen className="w-4 h-4" /></button>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-600 mt-1 block truncate font-medium">{val}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Variants Table */}
                {variants.length > 0 && (
                  <div className="mt-8">
                    {/* Bulk Actions */}
                    <div className="bg-gray-50 p-4 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-end gap-3">
                      <div className="flex-grow md:flex-grow-0">
                        <label className="text-xs text-gray-500 block mb-1">Giá bán hàng loạt</label>
                        <PriceInput
                          className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none text-gray-900"
                          placeholder="Nhập giá..."
                          value={Number(bulkPrice)}
                          onChange={(val) => setBulkPrice(val.toString())}
                        />
                      </div>
                      <div className="flex-grow md:flex-grow-0">
                        <label className="text-xs text-gray-500 block mb-1">Giá khuyến mãi</label>
                        <PriceInput
                          className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none text-gray-900"
                          placeholder="Nhập giá KM..."
                          value={Number(bulkSalePrice)}
                          onChange={(val) => setBulkSalePrice(val.toString())}
                        />
                      </div>
                      <div className="flex-grow md:flex-grow-0">
                        <label className="text-xs text-gray-500 block mb-1">Tồn kho hàng loạt</label>
                        <input type="number" className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none text-gray-900" placeholder="Nhập SL..." value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} />
                      </div>
                      <button onClick={handleBulkUpdate} className="bg-white border border-gray-400 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-50 hover:text-emerald-600 h-[34px]">
                        Áp dụng
                      </button>
                    </div>

                    <div className="overflow-hidden border border-gray-200 rounded-b-xl shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-16">Ảnh</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên biến thể</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32">Giá bán</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32">Giá KM</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-24">Kho</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32">SKU</th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map((variant, idx) => (
                              <tr key={variant.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {variant.image ? (
                                      <AgriImage src={variant.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-gray-300" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {Object.values(variant.attributes || {}).join(' - ')}
                                </td>
                                <td className="px-4 py-3">
                                  <PriceInput
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none text-gray-900"
                                    value={variant.price}
                                    onChange={(val) => updateVariant(idx, 'price', val)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <PriceInput
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none placeholder-gray-300"
                                    placeholder="0"
                                    value={variant.salePrice}
                                    onChange={(val) => updateVariant(idx, 'salePrice', val)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none text-gray-900"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1.5 border border-gray-400 rounded text-sm focus:border-emerald-500 outline-none uppercase"
                                    value={variant.sku}
                                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => {
                                      const newVariants = [...variants];
                                      newVariants.splice(idx, 1);
                                      setVariants(newVariants);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Xóa biến thể"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Shipping Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-500" /> Vận chuyển
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (Gram)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                  placeholder="VD: 500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước (cm) - D x R x C</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="D" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" value={dimensions.l} onChange={e => setDimensions({ ...dimensions, l: e.target.value })} />
                  <input type="number" placeholder="R" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" value={dimensions.w} onChange={e => setDimensions({ ...dimensions, w: e.target.value })} />
                  <input type="number" placeholder="C" className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900" value={dimensions.h} onChange={e => setDimensions({ ...dimensions, h: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. SEO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" /> Tối ưu SEO
              </h2>
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
                  {seoTitle || name || 'Tiêu đề trang hiển thị trên Google'}
                </p>
                <p className="text-xs text-green-700 truncate">
                  https://agrimart.vn/products/{slug || 'duong-dan-san-pham'}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {seoDesc || description || 'Mô tả trang hiển thị trên kết quả tìm kiếm Google...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa chính</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                  placeholder="Ví dụ: cà chua bi, cà chua đà lạt"
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                />
                <span className="text-xs text-gray-400 mt-1 block">Từ khóa trọng tâm để phân tích SEO (Lưu trữ và phục vụ tính năng sau này)</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề trang (SEO Title)</label>
                  <span className={`text-xs ${seoTitle.length > 70 ? 'text-red-500' : 'text-gray-400'}`}>{seoTitle.length}/70</span>
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                  placeholder={name}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Mô tả trang (Meta Description)</label>
                  <span className={`text-xs ${seoDesc.length > 320 ? 'text-red-500' : 'text-gray-400'}`}>{seoDesc.length}/320</span>
                </div>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div >

        {/* Right Column (1/3) */}
        < div className="space-y-6" >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-sm font-bold mb-4 text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <Tag className="w-4 h-4" /> Phân loại
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                <input
                  type="text"
                  placeholder="VD: Nông trại Xanh"
                  className="w-full px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thẻ (Tags)</label>
                <div className="w-full px-3 py-2 bg-white border border-gray-400 rounded-lg focus-within:border-emerald-500 flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium shadow-sm transition-all hover:bg-emerald-100">
                      {t} <button onClick={() => removeTag(t)} className="hover:text-red-500 focus:outline-none p-0.5 rounded-full hover:bg-emerald-200 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Nhập..."
                    className="flex-grow outline-none bg-transparent min-w-[50px] text-sm"
                    onKeyDown={handleTagKeyDown}
                    onBlur={handleTagBlur}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select className="w-full px-4 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="active">Đang bán</option>
                  <option value="draft">Bản nháp</option>
                  <option value="out_of_stock">Hết hàng</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-600">Sản phẩm nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-600">Cho phép đặt trước (Pre-order)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Kho hàng</h2>
              <Box className="w-4 h-4 text-gray-400" />
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-700 leading-relaxed">
                Quản lý kho nâng cao (nhập/xuất) sẽ được thực hiện trong phần <strong>Quản lý kho</strong> sau khi tạo sản phẩm.
              </p>
            </div>
          </div>
        </div >
      </div >
    </div >
  );
}