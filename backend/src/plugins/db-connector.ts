import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// This is where you'd put DB connection logic (e.g., Prisma, Mongoose)
const dbConnectorPlugin: FastifyPluginAsync = async (fastify) => {
    fastify.log.info('Database connector plugin registered (Mock mode)');
};

export default fp(dbConnectorPlugin);
