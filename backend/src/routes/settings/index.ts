import { FastifyPluginAsync } from 'fastify';
import prisma from '@/services/db.js';

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
    // Get all settings
    fastify.get('/', async (request, reply) => {
        try {
            const settings = await prisma.settings.findMany();

            // Convert array to object for easier access
            const settingsObj: Record<string, any> = {};
            settings.forEach(setting => {
                settingsObj[setting.key] = setting.value;
            });

            return settingsObj;
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to fetch settings');
        }
    });

    // Update settings (upsert)
    fastify.put('/', async (request, reply) => {
        try {
            const body = request.body as Record<string, any>;

            // Update each key-value pair
            const promises = Object.entries(body).map(([key, value]) =>
                prisma.settings.upsert({
                    where: { key },
                    update: { value: value as any },
                    create: { key, value: value as any }
                })
            );

            await Promise.all(promises);

            return { success: true, message: 'Settings updated successfully' };
        } catch (e) {
            request.log.error(e);
            return reply.internalServerError('Failed to update settings');
        }
    });
};

export default settingsRoutes;
