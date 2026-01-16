"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  List,
  Leaf,
  ChevronDown,
  Palette,
  BookOpen
} from 'lucide-react';

import { useCart } from '@/contexts/CartContext';

import { GlobalSettings, defaultSettings } from '@/lib/settings';

export const PublicLayout: React.FC<{ children: React.ReactNode; settings?: GlobalSettings }> = ({ children, settings = defaultSettings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();
  const pathname = usePathname();

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search when route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/api/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const navCategories = categories.map(cat => ({
    name: cat.name,
    path: `/san-pham?category=${encodeURIComponent(cat.name)}`
  }));


  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {settings.general.logo ? (
                <img src={settings.general.logo} alt={settings.general.siteTitle} className="h-10 w-auto object-contain rounded-lg" />
              ) : (
                <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-emerald-900 tracking-tight">{settings.general.siteTitle}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Trang chủ</Link>
              <Link href="/san-pham" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Sản phẩm</Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 font-medium transition-colors py-2 outline-none">
                  Danh mục <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left z-50 mt-1">
                  {navCategories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={cat.path}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link href="/san-pham" className="block px-4 py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider">
                      Xem tất cả
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/tin-tuc" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Bài viết</Link>
              <Link href="/gioi-thieu" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Giới thiệu</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors ${isSearchOpen ? 'text-emerald-600 bg-emerald-50 rounded-full' : 'text-gray-400 hover:text-emerald-600'}`}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              <Link href="/gio-hang" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                <User className="w-4 h-4" />
                <span>Admin</span>
              </Link>
              <button
                className="md:hidden p-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md p-4 animate-in slide-in-from-top-2 duration-200 z-40">
            <div className="container mx-auto max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm (Ví dụ: Cà chua, Gạo ST25...)"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50">Trang chủ</Link>
              <Link href="/san-pham" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50">Sản phẩm</Link>
              <div className="px-3 py-2">
                <div className="font-medium text-gray-900 mb-2">Danh mục</div>
                <div className="pl-4 space-y-2 border-l-2 border-emerald-100">
                  {navCategories.map((cat, idx) => (
                    <Link key={idx} href={cat.path} className="block text-sm text-gray-600 hover:text-emerald-600">{cat.name}</Link>
                  ))}
                </div>
              </div>
              <Link href="/tin-tuc" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50">Bài viết</Link>
              <Link href="/gioi-thieu" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50">Giới thiệu</Link>
              <Link href="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 bg-emerald-50 mt-2">Truy cập Admin</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow bg-white">
        {children}
      </main>

      <footer className="bg-emerald-900 text-emerald-100 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white p-1 rounded">
                {settings.general.logo ? (
                  <img src={settings.general.logo} alt="AgriMart" className="h-6 w-auto" />
                ) : (
                  <div className="bg-emerald-600 p-1.5 rounded-lg">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xl font-bold text-white">{settings.general.siteTitle}</span>
            </div>
            <p className="text-emerald-200/80 text-sm">
              {settings.general.tagline}
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/policy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="/policy" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="/policy" className="hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/san-pham" className="hover:text-white transition-colors">Rau củ</Link></li>
              <li><Link href="/san-pham" className="hover:text-white transition-colors">Trái cây</Link></li>
              <li><Link href="/san-pham" className="hover:text-white transition-colors">Thực phẩm khô</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <p className="text-sm text-emerald-200/80 mb-2">{settings.store.phone}</p>
            <p className="text-sm text-emerald-200/80 mb-2">{settings.store.email}</p>
            <p className="text-sm text-emerald-200/80">{settings.store.address}</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-emerald-800 text-center text-xs text-emerald-400">
          © {new Date().getFullYear()} {settings.general.siteTitle}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Exclude sidebar for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
    { path: '/admin/categories', label: 'Danh mục', icon: List },
    { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
    { path: '/admin/blog', label: 'Bài viết', icon: FileText },
    { path: '/admin/about', label: 'Giới thiệu', icon: BookOpen },
    { path: '/admin/appearance', label: 'Giao diện', icon: Palette },
    { path: '/admin/settings', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">AgriMart Admin</span>
          </Link>
        </div>

        <div className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            Thoát
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
};