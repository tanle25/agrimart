import { FastifyPluginAsync } from 'fastify';
import prisma from '../../services/db.js';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async (request) => {
        try {
            // Get total revenue and orders
            const orders = await prisma.order.findMany({
                select: {
                    totalAmount: true,
                    shippingFee: true,
                    createdAt: true,
                    items: {
                        select: {
                            quantity: true
                        }
                    }
                }
            });

            const totalRevenue = orders.reduce((sum, order) => sum + ((order.totalAmount || 0) + (order.shippingFee || 0)), 0);
            const totalOrders = orders.length;
            const totalProductsSold = orders.reduce((sum, order) =>
                sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
            );

            // Get best seller
            const productSales = await prisma.orderItem.groupBy({
                by: ['productName'],
                _sum: {
                    quantity: true
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc'
                    }
                },
                take: 1
            });

            const bestSeller = productSales.length > 0 ? productSales[0].productName : '---';

            // Get chart data for last 7 days
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (6 - i));
                return date;
            });

            const chartData = last7Days.map(date => {
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const dayOrders = orders.filter(order =>
                    order.createdAt >= dayStart && order.createdAt <= dayEnd
                );

                const daySales = dayOrders.reduce((sum, order) => sum + ((order.totalAmount || 0) + (order.shippingFee || 0)), 0);
                const dayOrderCount = dayOrders.length;

                return {
                    name: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
                    sales: daySales,
                    orders: dayOrderCount
                };
            });

            return {
                stats: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    productsSold: totalProductsSold,
                    bestSeller
                },
                chart: chartData
            };
        } catch (error) {
            request.log.error(error);
            return {
                stats: {
                    revenue: 0,
                    orders: 0,
                    productsSold: 0,
                    bestSeller: '---'
                },
                chart: []
            };
        }
    });
};

export default dashboardRoutes;
