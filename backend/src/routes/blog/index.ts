import { FastifyPluginAsync } from 'fastify';
import prisma from '../../services/db.js';

const blogRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async (request) => {
        const { limit } = request.query as { limit?: number };
        return prisma.blogPost.findMany({
            include: { category: true },
            take: limit ? Number(limit) : undefined,
            orderBy: { date: 'desc' }
        });
    });

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const isId = !isNaN(Number(id));
        const post = await prisma.blogPost.findFirst({
            where: isId ? { id: Number(id) } : { slug: id },
            include: { category: true }
        });

        if (!post) {
            return reply.notFound('Blog post not found');
        }
        return post;
    });

    fastify.post('/check-slug', async (request) => {
        const { slug } = request.body as { slug: string };
        const count = await prisma.blogPost.count({
            where: { slug }
        });
        return { exists: count > 0 };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        try {
            const post = await prisma.blogPost.create({
                data: {
                    title: data.title,
                    slug: data.slug,
                    content: data.content,
                    excerpt: data.excerpt,
                    image: data.image,
                    categoryId: data.categoryId ? Number(data.categoryId) : undefined,
                    tags: data.tags || [],
                    author: data.author,
                    readTime: data.readTime,
                    featured: data.featured || false,
                    seoTitle: data.seoTitle,
                    seoDesc: data.seoDesc,
                    mainKeyword: data.mainKeyword,
                    date: new Date().toLocaleDateString('vi-VN') // Simple date string or use createdAt
                }
            });
            return post;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to create blog post');
        }
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        try {
            const post = await prisma.blogPost.update({
                where: { id: Number(id) },
                data: {
                    title: data.title,
                    slug: data.slug,
                    content: data.content,
                    excerpt: data.excerpt,
                    image: data.image,
                    categoryId: data.categoryId ? Number(data.categoryId) : undefined,
                    tags: data.tags || [],
                    author: data.author,
                    readTime: data.readTime,
                    featured: data.featured,
                    seoTitle: data.seoTitle,
                    seoDesc: data.seoDesc,
                    mainKeyword: data.mainKeyword
                }
            });
            return post;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to update blog post');
        }
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.blogPost.delete({
                where: { id: Number(id) }
            });
            return { success: true };
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to delete blog post');
        }
    });
};

export default blogRoutes;
