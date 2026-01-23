"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { GlobalSettings, defaultSettings } from '@/lib/settings';

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data) setSettings(data);
            })
            .catch(err => console.error("Failed to load settings", err));
    }, []);

    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/admin/dashboard');
                router.refresh(); // Refresh to update middleware state
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white p-10 md:p-12 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
                {/* Decorative Top Gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center mb-6">
                        {settings.general.logo ? (
                            <img
                                src={settings.general.logo}
                                alt={settings.general.siteTitle}
                                className="h-16 w-auto object-contain rounded-xl hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
                                <Leaf className="w-10 h-10 text-white" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{settings.general.siteTitle}</h1>
                    <p className="text-gray-500 mt-3 text-base">Cổng thông tin quản trị hệ thống</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100 animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Email của bạn</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600 text-gray-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                            <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Quên mật khẩu?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600 text-gray-400">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-emerald-600/30"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                <>
                                    Đăng nhập
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-50 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                        © {new Date().getFullYear()} {settings.general.siteTitle} Platform. <br />
                        Protected by Secure Gateway.
                    </p>
                </div>
            </div>
        </div>
    );
}
