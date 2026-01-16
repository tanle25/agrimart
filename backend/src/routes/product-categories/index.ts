
import { FastifyInstance } from 'fastify';
import prisma from '../../services/db.js';

export default async function (fastify: FastifyInstance) {
    // GET all categories
    fastify.get('/', async (request, reply) => {
        try {
            const categories = await prisma.productCategory.findMany({
                orderBy: { name: 'asc' }
            });
            return categories;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to fetch product categories');
        }
    });

    // POST create category
    fastify.post('/', async (request, reply) => {
        const { name, image, description } = request.body as { name: string, image?: string, description?: string };
        if (!name) return reply.badRequest('Name is required');

        const slug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        try {
            const category = await prisma.productCategory.create({
                data: { name, slug, image, description }
            });
            return category;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to create product category');
        }
    });

    // PUT update category
    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name, image, description } = request.body as { name: string, image?: string, description?: string };

        try {
            const slug = name ? name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-") : undefined;

            const category = await prisma.productCategory.update({
                where: { id: Number(id) },
                data: { name, slug, image, description }
            });
            return category;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to update product category');
        }
    });

    // DELETE category
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.productCategory.delete({
                where: { id: Number(id) }
            });
            return { success: true };
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to delete product category');
        }
    });
}
