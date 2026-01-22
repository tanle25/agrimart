"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { AgriImage } from '@/components/ui/AgriImage';

export const PublicLayout: React.FC<{ children: React.ReactNode; settings?: GlobalSettings }> = ({ children, settings = defaultSettings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cartCount } = useCart();
  const pathname = usePathname();

  // Handle closing menu with animation
  const handleCloseMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 400);
  }, []);

  // ESC key handler and focus trap for mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        handleCloseMenu();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (!isMobileMenuOpen || e.key !== 'Tab' || !mobileMenuRef.current) return;

      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = '';
      };
    }
  }, [isMobileMenuOpen, handleCloseMenu]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search when route changes or ESC key pressed
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  // ESC key handler for search overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const hasFetchedCategories = useRef(false);

  useEffect(() => {
    // Only fetch once
    if (hasFetchedCategories.current) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/api/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          hasFetchedCategories.current = true;
        }
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const navCategories = useMemo(() =>
    categories.map(cat => ({
      name: cat.name,
      path: `/san-pham?category=${encodeURIComponent(cat.name)}`
    })),
    [categories]
  );


  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 h-16 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {settings.general.logo ? (
                <div className="h-10 w-10 relative">
                  <AgriImage
                    src={settings.general.logo}
                    alt=""
                    className="rounded-lg object-contain"
                    width={40}
                    height={40}
                    priority
                  />
                </div>
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
                <button
                  className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 font-medium transition-colors py-2 outline-none"
                  aria-haspopup="true"
                  aria-expanded="false"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.nextElementSibling?.classList.toggle('opacity-0');
                      e.currentTarget.nextElementSibling?.classList.toggle('invisible');
                    }
                  }}
                >
                  Danh mục <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left z-50 mt-1">
                  {navCategories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={cat.path}
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors focus:bg-emerald-50 focus:text-emerald-600 focus:outline-none"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link href="/san-pham" className="block px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset">
                      Xem tất cả
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/tin-tuc" className="text-gray-600 hover:text-emerald-700 font-medium transition-colors">Bài viết</Link>
              <Link href="/gioi-thieu" className="text-gray-600 hover:text-emerald-700 font-medium transition-colors">Giới thiệu</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label={isSearchOpen ? "Đóng tìm kiếm" : "Tìm kiếm sản phẩm"}
                aria-expanded={isSearchOpen}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors ${isSearchOpen ? 'text-emerald-700 bg-emerald-50 rounded-full' : 'text-gray-500 hover:text-emerald-700'}`}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              <Link
                href="/gio-hang"
                aria-label={cartCount > 0 ? `Giỏ hàng (${cartCount} sản phẩm)` : "Giỏ hàng"}
                className="p-2 text-gray-500 hover:text-emerald-700 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
                <User className="w-4 h-4" />
                <span>Admin</span>
              </Link>
              <button
                type="button"
                aria-label="Mở menu điều hướng"
                aria-expanded={isMobileMenuOpen}
                className="md:hidden p-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
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

        {/* Mobile Menu Drawer */}
        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <>
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes slide-in-right-drawer {
                0% { transform: translateX(100%); }
                100% { transform: translateX(0); }
              }
              @keyframes slide-out-right-drawer {
                0% { transform: translateX(0); }
                100% { transform: translateX(100%); }
              }
              @keyframes fade-in-backdrop {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              @keyframes fade-out-backdrop {
                0% { opacity: 1; }
                100% { opacity: 0; }
              }
            `}} />
            <div className="fixed inset-0 z-50 md:hidden flex justify-end">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                style={{
                  animation: isClosing
                    ? 'fade-out-backdrop 0.4s ease-in forwards'
                    : 'fade-in-backdrop 0.3s ease-out forwards'
                }}
                onClick={handleCloseMenu}
              />

              {/* Drawer Content */}
              <div
                ref={mobileMenuRef}
                className="bg-white w-[85%] max-w-sm h-full shadow-2xl relative flex flex-col"
                style={{
                  animation: isClosing
                    ? 'slide-out-right-drawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    : 'slide-in-right-drawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Menu điều hướng chính"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1 rounded-lg">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Menu</span>
                  </div>
                  <button onClick={handleCloseMenu} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Drawer Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  <Link
                    href="/"
                    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={handleCloseMenu}
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/san-pham"
                    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={handleCloseMenu}
                  >
                    Sản phẩm
                  </Link>

                  {/* Categories Accordion */}
                  <div className="px-1">
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="w-full flex items-center justify-between px-3 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <span>Danh mục</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isCategoriesOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      {navCategories.map((cat, idx) => (
                        <Link
                          key={idx}
                          href={cat.path}
                          className="block pl-9 pr-4 py-2.5 text-sm text-gray-600 hover:text-emerald-700 border-l-2 border-transparent hover:border-emerald-500 transition-colors"
                          onClick={handleCloseMenu}
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        href="/san-pham"
                        className="block pl-9 pr-4 py-2.5 text-xs font-bold text-emerald-700 uppercase tracking-wider"
                        onClick={handleCloseMenu}
                      >
                        Xem tất cả
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/tin-tuc"
                    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={handleCloseMenu}
                  >
                    Bài viết
                  </Link>
                  <Link
                    href="/gioi-thieu"
                    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    onClick={handleCloseMenu}
                  >
                    Giới thiệu
                  </Link>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm"
                    onClick={handleCloseMenu}
                  >
                    <User className="w-4 h-4" /> Truy cập Admin
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <main className="flex-1 bg-white overflow-auto">
        {children}
      </main>

      <footer className="bg-emerald-900 text-emerald-100 flex-shrink-0 py-8">
        <div className="container mx-auto px-4">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                {settings.general.logo ? (
                  <div className="h-8 w-32 relative">
                    <AgriImage
                      src={settings.general.logo}
                      alt=""
                      className="object-contain"
                      fill
                      sizes="128px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="bg-emerald-700 p-2 rounded-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="text-lg font-bold text-white">{settings.general.siteTitle}</span>
              </div>
              <p className="text-emerald-200/80 text-sm leading-relaxed max-w-xs">
                {settings.general.tagline}
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Liên kết</h3>
              <ul className="space-y-1 text-xs">
                <li><Link href="/chinh-sach-bao-mat" className="block py-1 hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                <li><Link href="/dieu-khoan-dich-vu" className="block py-1 hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link href="/chinh-sach-van-chuyen" className="block py-1 hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Danh mục</h3>
              <ul className="space-y-1 text-xs">
                <li><Link href="/san-pham" className="block py-1 hover:text-white transition-colors">Rau củ hữu cơ</Link></li>
                <li><Link href="/san-pham" className="block py-1 hover:text-white transition-colors">Trái cây tươi</Link></li>
                <li><Link href="/san-pham" className="block py-1 hover:text-white transition-colors">Thực phẩm khô</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Liên hệ</h3>
              <p className="text-xs text-emerald-200/80 mb-1">Hotline: {settings.store.phone}</p>
              <p className="text-xs text-emerald-200/80 mb-1">Email: {settings.store.email}</p>
              <p className="text-xs text-emerald-200/80">Đ/c: {settings.store.address}</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-4 pt-4 border-t border-emerald-800 text-center text-[10px] text-emerald-400">
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