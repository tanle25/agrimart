"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> {change}
            </span>
            <span className="text-gray-400 ml-2">so với tháng trước</span>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = React.useState({
        revenue: 0,
        orders: 0,
        productsSold: 0,
        bestSeller: '---'
    });
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/dashboard`);
                const data = await res.json();
                if (data.stats) setStats(data.stats);
                if (data.chart) setChartData(data.chart);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                <p className="text-gray-500">Chào mừng trở lại! Đây là tình hình kinh doanh hôm nay.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.revenue)}
                    change="---"
                    icon={DollarSign}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Đơn hàng"
                    value={stats.orders}
                    change="---"
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Sản phẩm đã bán"
                    value={stats.productsSold}
                    change="---"
                    icon={Users}
                    color="bg-violet-500"
                />
                <StatCard
                    title="Bán chạy nhất"
                    value={stats.bestSeller}
                    change="---"
                    icon={TrendingUp}
                    color="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Doanh thu 7 ngày qua</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} padding={{ top: 20 }}
                                    tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", maximumFractionDigits: 1 }).format(value)}
                                />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                                <Bar dataKey="sales" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Số lượng đơn hàng</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="orders" name="Đơn hàng" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
