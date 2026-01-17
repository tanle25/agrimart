import { FastifyPluginAsync } from 'fastify';

import prisma from '../../services/db.js';

const blogCategoryRoutes: FastifyPluginAsync = async (fastify) => {
    // GET all categories
    fastify.get('/', async () => {
        return prisma.blogCategory.findMany({
            orderBy: { name: 'asc' }
        });
    });

    // POST create category
    fastify.post('/', async (request, reply) => {
        const { name } = request.body as { name: string };
        if (!name) return reply.badRequest('Name is required');

        const slug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        try {
            const category = await prisma.blogCategory.create({
                data: { name, slug }
            });
            return category;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to create category');
        }
    });

    // PUT update category
    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name } = request.body as { name: string };

        const slug = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        try {
            const category = await prisma.blogCategory.update({
                where: { id: Number(id) },
                data: { name, slug }
            });
            return category;
        } catch (e) {
            return reply.internalServerError('Failed to update category');
        }
    });

    // DELETE category
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.blogCategory.delete({
                where: { id: Number(id) }
            });
            return { success: true };
        } catch (e) {
            return reply.internalServerError('Failed to delete category');
        }
    });
};

export default blogCategoryRoutes;
