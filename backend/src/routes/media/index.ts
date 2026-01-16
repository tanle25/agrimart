import { FastifyPluginAsync } from 'fastify';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '../../../public/uploads');

const mediaRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async (request, reply) => {
        try {
            const { readdir } = await import('fs/promises');
            const files = await readdir(UPLOAD_DIR);

            // Filter for image files (webp, jpg, png, etc.)
            // In a real app, you might want paginated results from a DB
            const imageFiles = files.filter(file => /\.(webp|png|jpg|jpeg|gif)$/i.test(file));

            const urls = imageFiles.map(file => `/api/media/${file}`);
            return {
                items: urls
            };
        } catch (err) {
            request.log.error(err);
            return { items: [] };
        }
    });

    fastify.get('/:filename', async (request, reply) => {
        const { filename } = request.params as { filename: string };

        // Serve file using fastify-static (registered in app.ts)
        // or manually if preferred. Since we registered static on '../public',
        // we can just return the file from 'uploads/filename'.

        return reply.sendFile(`uploads/${filename}`);
    });
};

export default mediaRoutes;
