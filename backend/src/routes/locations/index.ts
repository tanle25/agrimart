import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const locationRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    // Get all provinces
    fastify.get('/provinces', async (request, reply) => {
        try {
            const provinces = await prisma.province.findMany({
                orderBy: { name: 'asc' }
            });
            return provinces;
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch provinces' });
        }
    });

    // Get districts by province code
    fastify.get('/districts/:provinceCode', async (request, reply) => {
        const { provinceCode } = request.params as { provinceCode: string };
        try {
            const districts = await prisma.district.findMany({
                where: { provinceCode },
                orderBy: { name: 'asc' }
            });
            return districts;
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch districts' });
        }
    });

    // Get wards by district code
    fastify.get('/wards/:districtCode', async (request, reply) => {
        const { districtCode } = request.params as { districtCode: string };
        try {
            const wards = await prisma.ward.findMany({
                where: { districtCode },
                orderBy: { name: 'asc' }
            });
            return wards;
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch wards' });
        }
    });

    // --- V2 Endpoints (2025 Standard) ---

    // Get all provinces V2
    fastify.get('/v2/provinces', async (request, reply) => {
        try {
            const provinces = await (prisma as any).provinceV2.findMany({
                orderBy: { name: 'asc' }
            });
            return provinces;
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch provinces V2' });
        }
    });

    // Get wards by province code V2 (Direct linkage, no District)
    fastify.get('/v2/wards/:provinceCode', async (request, reply) => {
        const { provinceCode } = request.params as { provinceCode: string };
        try {
            const wards = await (prisma as any).wardV2.findMany({
                where: { provinceCode },
                orderBy: { name: 'asc' }
            });
            return wards;
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch wards V2' });
        }
    });
};

export default locationRoutes;
