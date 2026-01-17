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
        const query = request.query as { w?: string; h?: string; q?: string };
        const filepath = join(UPLOAD_DIR, filename);

        // Check if file exists
        const { stat, readFile } = await import('fs/promises');
        try {
            await stat(filepath);
        } catch {
            return reply.code(404).send({ error: 'File not found' });
        }

        // If no resize needed, send file directly
        if (!query.w && !query.h && !query.q) {
            return reply.sendFile(`uploads/${filename}`);
        }

        // Process image with sharp
        try {
            const sharp = (await import('sharp')).default;
            const width = query.w ? parseInt(query.w) : undefined;
            const height = query.h ? parseInt(query.h) : undefined;
            const quality = query.q ? parseInt(query.q) : 80;

            const buffer = await readFile(filepath);
            let imagePipeline = sharp(buffer);

            if (width || height) {
                imagePipeline = imagePipeline.resize(width, height, {
                    fit: 'cover',
                    withoutEnlargement: true
                });
            }

            // Optimize based on file type
            if (filename.toLowerCase().endsWith('.webp')) {
                imagePipeline = imagePipeline.webp({ quality });
            } else if (filename.toLowerCase().endsWith('.jpeg') || filename.toLowerCase().endsWith('.jpg')) {
                imagePipeline = imagePipeline.jpeg({ quality });
            } else if (filename.toLowerCase().endsWith('.png')) {
                // PNG compression is different (0-9)
                imagePipeline = imagePipeline.png({ quality: quality > 100 ? 100 : quality });
            }

            const processedBuffer = await imagePipeline.toBuffer();

            const mimeType = filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

            reply.header('Content-Type', mimeType);
            reply.header('Cache-Control', 'public, max-age=31536000, immutable');
            return reply.send(processedBuffer);
        } catch (err) {
            request.log.error(err);
            // Fallback to original file
            return reply.sendFile(`uploads/${filename}`);
        }
    });
};

export default mediaRoutes;
