export interface Attribute {
  name: string;
  values: string[]; // e.g., ["Red", "Green"] or ["1kg", "2kg"]
}

export interface Variant {
  id: string;
  sku?: string;
  price: number;
  salePrice?: number; // New field
  stock?: number;
  attributes?: Record<string, string>; // e.g., { "Màu sắc": "Đỏ", "Khối lượng": "1kg" }
  image?: string;
  name?: string; // For mock data compatibility
}

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description: string;
  category: string;
  price: number; // Base price
  salePrice?: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  type: 'simple' | 'variable';
  attributes?: Attribute[];
  variants?: Variant[];
  isDraft?: boolean;
  stock?: number;
  rating?: number;
  reviews?: number;
  discount?: number;
  sku?: string;
  barcode?: string;
  status?: 'active' | 'draft' | 'out_of_stock';
  dimensions?: { length: number; width: number; height: number };
  weight?: number;
  seoTitle?: string;
  seoDescription?: string;
  vendor?: string;
  tags?: string[];
  content?: string;
}

export interface Category {
  id: string | number;
  name: string;
  slug: string;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
  categoryId?: number;
  category?: BlogCategory;
  featured?: boolean;
}