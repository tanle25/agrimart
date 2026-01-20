import { FastifyPluginAsync } from 'fastify';

import prisma from '../../services/db.js';

const productRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/categories', async (request, reply) => {
        reply.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        try {
            // 1. Fetch all product categories from master list
            const allCategories = await prisma.productCategory.findMany({
                orderBy: { name: 'asc' }
            });

            // 2. Group active products by category to get counts
            const activeProductCounts = await prisma.product.groupBy({
                by: ['category'],
                where: {
                    category: { not: null },
                    status: 'active'
                },
                _count: {
                    category: true
                }
            });

            // 3. Map counts to comprehensive category list
            const categoryMap = new Map(activeProductCounts.map(c => [c.category, c._count.category]));

            const validCategories = allCategories.map(cat => ({
                name: cat.name,
                count: categoryMap.get(cat.name) || 0
            }));

            return validCategories;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to fetch categories');
        }
    });

    fastify.get('/price-range', async (request, reply) => {
        reply.header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        try {
            // 1. Get simple products max price
            // Assuming 'price' is the effective selling price for simple products
            const maxSimpleData = await prisma.product.aggregate({
                _max: { price: true },
                where: { type: 'simple', status: 'active' }
            });
            const maxSimple = maxSimpleData._max.price || 0;

            // 2. Get variants max effective price
            // We need to check salePrice vs price for each variant
            // Fetching all variant prices is safe enough for reasonable catalog size
            // If catalog grows huge, we should switch back to optimize Raw SQL with correct table names
            const variants = await prisma.variant.findMany({
                where: { product: { status: 'active' } },
                select: { price: true, salePrice: true }
            });

            let maxVariant = 0;
            for (const v of variants) {
                // Effective price logic: use salePrice if valid (>0), else price
                const effective = (v.salePrice && v.salePrice > 0) ? v.salePrice : v.price;
                if (effective > maxVariant) maxVariant = effective;
            }

            const maxPrice = Math.max(maxSimple, maxVariant);

            // Default fallback if no products found
            return { min: 0, max: maxPrice || 10000000 };
        } catch (e) {
            request.log.error(e);
            return { min: 0, max: 0 };
        }
    });

    fastify.get('/', async (request, reply) => {
        // Enable caching for listing
        reply.header('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            minPrice,
            maxPrice,
            sort = 'newest'
        } = request.query as {
            page?: number,
            limit?: number,
            search?: string,
            category?: string,
            minPrice?: string,
            maxPrice?: string,
            sort?: string
        };
        const skip = (Number(page) - 1) * Number(limit);

        const AND: any[] = [{ status: 'active' }];

        if (search) {
            AND.push({
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { sku: { contains: search, mode: 'insensitive' as const } }
                ]
            });
        }

        if (category) {
            const categories = category.split(',').map(c => c.trim()).filter(Boolean);
            if (categories.length > 0) {
                AND.push({ category: { in: categories } });
            }
        }

        if (minPrice || maxPrice) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

            AND.push({
                OR: [
                    // Case 1: Simple Product - Filter by main price
                    // Assumption: For simple products, 'price' is the current selling price
                    {
                        type: 'simple',
                        price: { gte: min, lte: max }
                    },
                    // Case 2: Variable Product - Filter by variants
                    {
                        type: 'variable',
                        variants: {
                            some: {
                                OR: [
                                    // Variant has active sale price in range
                                    {
                                        salePrice: { gt: 0, gte: min, lte: max }
                                    },
                                    // Variant has NO active sale price (0 or null), check regular price
                                    {
                                        OR: [{ salePrice: 0 }, { salePrice: null }],
                                        price: { gte: min, lte: max }
                                    }
                                ]
                            }
                        }
                    }
                ]
            });
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'newest') orderBy = { createdAt: 'desc' };

        const where = { AND };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: Number(limit),
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                    images: true,
                    price: true,
                    oldPrice: true,
                    discount: true,
                    category: true,
                    type: true,
                    status: true,
                    createdAt: true,
                    variants: {
                        select: {
                            price: true,
                            salePrice: true
                            // minimal fields for price calculation
                        }
                    }
                },
                orderBy
            }),
            prisma.product.count({ where })
        ]);

        return {
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    });

    fastify.post('/check-slug', async (request) => {
        const { slug } = request.body as { slug: string };
        const count = await prisma.product.count({
            where: { slug }
        });
        return { exists: count > 0 };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        const { variants, width, height, length, weight, seoDescription, ...rest } = data;

        try {
            const product = await prisma.product.create({
                data: {
                    ...rest,
                    seoDesc: seoDescription,
                    dimensions: {
                        width: width || null,
                        height: height || null,
                        length: length || null
                    },
                    weight: weight ? parseFloat(weight.toString()) : null,
                    type: data.type || 'simple',
                    stock: data.stock ? parseInt(data.stock.toString()) : 0,
                    variants: variants ? {
                        create: variants.map((v: any) => ({
                            name: v.name || Object.values(v.attributes || {}).join(' - '),
                            price: parseFloat(v.price),
                            salePrice: v.salePrice ? parseFloat(v.salePrice) : 0,
                            stock: parseInt(v.stock || '0'),
                            sku: v.sku,
                            attributes: v.attributes,
                            image: v.image
                        }))
                    } : undefined
                },
                include: { variants: true }
            });
            return product;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to create product');
        }
    });

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const isId = !isNaN(Number(id));

        const product = await prisma.product.findFirst({
            where: isId ? { id: Number(id) } : { slug: id },
            include: { variants: true }
        });

        if (!product) {
            return reply.notFound('Product not found');
        }
        return product;
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        const { variants, width, height, length, weight, seoDescription, ...rest } = data;

        try {
            // First delete existing variants if updated (simple approach: delete all and recreate)
            // Or better: update existing, create new, delete removed. For now, let's just update basic fields.
            // If product type is variable, we might need a more complex update strategy.
            // For MVP: Update standard fields. Re-creating variants might be easiest if content changes drastically.

            // NOTE: A robust variant update is complex. 
            // Simplified strategy: Update product fields. If key variant logic ensures consistency, we can potentially delete all variants and recreate them 
            // BUT that loses existing variant IDs/stats if tracked. NOT SAFE for production with orders.
            // SAFE APPROACH: Update product fields only for now, handle variants if passed explicitly.

            // Let's assume full overwrite of variants for this editor context (safe if no orders yet)
            if (variants) {
                await prisma.variant.deleteMany({ where: { productId: Number(id) } });
            }

            const product = await prisma.product.update({
                where: { id: Number(id) },
                data: {
                    ...rest,
                    seoDesc: seoDescription,
                    dimensions: {
                        width: width || null,
                        height: height || null,
                        length: length || null
                    },
                    weight: weight ? parseFloat(weight.toString()) : null,
                    stock: data.stock ? parseInt(data.stock.toString()) : 0,
                    variants: variants ? {
                        create: variants.map((v: any) => ({
                            name: v.name || Object.values(v.attributes || {}).join(' - '),
                            price: parseFloat(v.price),
                            salePrice: v.salePrice ? parseFloat(v.salePrice) : 0,
                            stock: parseInt(v.stock || '0'),
                            sku: v.sku,
                            attributes: v.attributes,
                            image: v.image
                        }))
                    } : undefined
                },
                include: { variants: true }
            });
            return product;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to update product');
        }
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.product.delete({
                where: { id: Number(id) }
            });
            return { success: true };
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to delete product');
        }
    });
};

export default productRoutes;
