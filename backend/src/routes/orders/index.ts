import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrderItemInput {
    productId: number;
    variantId?: string; // ID of variant if exists
    quantity: number;
    price: number; // Client sends price, but backend should ideally verify. For now we stick to client or re-fetch.
    // Better: Backend re-fetches price.
}

interface OrderInput {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    city?: string;
    district?: string;
    ward?: string;
    note?: string;
    paymentMethod: string;
    items: OrderItemInput[];
}

const orderRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.post('/', async (request, reply) => {
        const data = request.body as OrderInput;

        try {
            // Validate items
            if (!data.items || data.items.length === 0) {
                return reply.code(400).send({ error: "Order must have items" });
            }

            // Calculate total and prepare items data
            // To be secure, we should fetch products from DB to get their real prices.

            const productIds = data.items.map(i => i.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                include: { variants: true }
            });

            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of data.items) {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    throw new Error(`Product ID ${item.productId} not found`);
                }

                let finalPrice = product.price;
                let productName = product.name;
                let productImage = product.image || product.images[0] || '';

                if (item.variantId) {
                    const variant = product.variants.find(v => v.id === item.variantId);
                    if (variant) {
                        finalPrice = variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.price;
                        productName = `${product.name} - ${variant.name}`;
                        if (variant.image) productImage = variant.image;
                    }
                }

                totalAmount += finalPrice * item.quantity;
                orderItemsData.push({
                    productId: product.id,
                    variantId: item.variantId,
                    productName: productName,
                    image: productImage,
                    price: finalPrice,
                    quantity: item.quantity
                });
            }

            // Calculate Shipping
            const shippingFee = totalAmount > 500000 ? 0 : 30000;
            const finalTotal = totalAmount + shippingFee;

            // Create Order Transaction
            const order = await prisma.order.create({
                data: {
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    customerEmail: data.customerEmail,
                    shippingAddress: data.shippingAddress,
                    city: data.city,
                    district: data.district,
                    ward: data.ward,
                    note: data.note,
                    paymentMethod: data.paymentMethod,
                    totalAmount: finalTotal,
                    shippingFee,
                    status: 'pending',
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true
                }
            });

            return reply.code(201).send(order);

        } catch (error) {
            console.error("Order creation failed:", error);
            return reply.code(500).send({ error: "Failed to create order" });
        }
    });

    fastify.get('/', async (request, reply) => {
        const { page = 1, limit = 20, status, search } = request.query as {
            page?: number;
            limit?: number;
            status?: string;
            search?: string;
        };

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};

        if (status && status !== 'Tất cả trạng thái') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { customerName: { contains: search } },
                { id: { equals: parseInt(search) || undefined } } // Attempt to match ID if number
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
                include: { items: true }
            }),
            prisma.order.count({ where })
        ]);

        return {
            data: orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    });

    fastify.put('/:id/status', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: string };

        const VALID_STATUSES = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        if (!VALID_STATUSES.includes(status)) {
            return reply.code(400).send({ error: "Invalid status" });
        }

        try {
            const order = await prisma.order.update({
                where: { id: Number(id) },
                data: { status },
                include: { items: true }
            });
            return order;
        } catch (error) {
            console.error("Failed to update status", error);
            return reply.code(500).send({ error: "Failed to update order status" });
        }
    });
};

export default orderRoutes;
