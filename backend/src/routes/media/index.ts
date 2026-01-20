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
        const query = request.query as { w?: string; h?: string; q?: string; fmt?: string };
        const filepath = join(UPLOAD_DIR, filename);

        // Check if file exists
        const { stat, readFile } = await import('fs/promises');
        try {
            await stat(filepath);
        } catch {
            return reply.code(404).send({ error: 'File not found' });
        }

        // Default to webp if requested or if originally webp
        const targetFormat = query.fmt === 'webp' ? 'webp' :
            filename.toLowerCase().endsWith('.webp') ? 'webp' :
                filename.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';

        // If no resize AND no format change needed, send file directly
        const isOriginalFormat = (targetFormat === 'webp' && filename.toLowerCase().endsWith('.webp')) ||
            (targetFormat === 'png' && filename.toLowerCase().endsWith('.png')) ||
            (targetFormat === 'jpeg' && (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')));

        if (!query.w && !query.h && !query.q && isOriginalFormat) {
            reply.header('Cache-Control', 'public, max-age=31536000, immutable');
            return reply.sendFile(`uploads/${filename}`);
        }

        // Create cache key
        const width = query.w ? parseInt(query.w) : undefined;
        const height = query.h ? parseInt(query.h) : undefined;
        const quality = query.q ? parseInt(query.q) : 80;

        const { parse } = await import('path');
        const parsed = parse(filename);
        const cacheFilename = `${parsed.name}_w${width || 'auto'}_h${height || 'auto'}_q${quality}.${targetFormat}`;
        const cacheDir = join(UPLOAD_DIR, 'cache');
        const cachePath = join(cacheDir, cacheFilename);

        // Ensure cache directory exists
        const { mkdir } = await import('fs/promises');
        await mkdir(cacheDir, { recursive: true });

        // Check if cached file exists
        try {
            await stat(cachePath);
            // If exists, serve it
            const mimeType = targetFormat === 'webp' ? 'image/webp' :
                targetFormat === 'png' ? 'image/png' : 'image/jpeg';
            reply.header('Content-Type', mimeType);
            reply.header('Cache-Control', 'public, max-age=31536000, immutable');
            reply.header('X-Cache', 'HIT'); // Debug header
            return reply.sendFile(`uploads/cache/${cacheFilename}`);
        } catch {
            // Not cached, proceed to process
        }

        // Process image with sharp
        try {
            const sharp = (await import('sharp')).default;

            const buffer = await readFile(filepath);
            let imagePipeline = sharp(buffer);

            if (width || height) {
                imagePipeline = imagePipeline.resize(width, height, {
                    fit: 'cover',
                    withoutEnlargement: true
                });
            }

            // Convert to target format
            if (targetFormat === 'webp') {
                imagePipeline = imagePipeline.webp({ quality });
            } else if (targetFormat === 'jpeg') {
                imagePipeline = imagePipeline.jpeg({ quality });
            } else if (targetFormat === 'png') {
                imagePipeline = imagePipeline.png({ quality: quality > 100 ? 100 : quality });
            }

            // Save to cache FIRST, then send
            await imagePipeline.toFile(cachePath);

            const mimeType = targetFormat === 'webp' ? 'image/webp' :
                targetFormat === 'png' ? 'image/png' : 'image/jpeg';

            reply.header('Content-Type', mimeType);
            reply.header('Cache-Control', 'public, max-age=31536000, immutable');
            reply.header('X-Cache', 'MISS');
            return reply.sendFile(`uploads/cache/${cacheFilename}`);
        } catch (err) {
            request.log.error(err);
            // Fallback to original file
            return reply.sendFile(`uploads/${filename}`);
        }
    });
};

export default mediaRoutes;
