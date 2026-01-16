import { FastifyPluginAsync } from 'fastify';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '../../../public/uploads');

const uploadRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        try {
            console.log('Upload request received');
            const data = await request.file();

            if (!data) {
                console.log('No data found in request');
                throw fastify.httpErrors.badRequest('No file uploaded');
            }
            console.log('File detected:', data.filename, data.mimetype);

            // Ensure upload directory exists
            await mkdir(UPLOAD_DIR, { recursive: true });

            const uuid = randomUUID();
            // Convert to webp for SEO optimization
            const filename = `${uuid}.webp`;
            const filePath = join(UPLOAD_DIR, filename);

            console.log('Processing file to buffer...');
            // Read file into buffer for sharp processing
            const buffer = await data.toBuffer();
            console.log('Buffer created, size:', buffer.length);

            console.log('Converting with Sharp to:', filePath);
            await sharp(buffer)
                .webp({ quality: 80 })
                .toFile(filePath);
            console.log('Sharp conversion complete');

            // Force URL construction to use request host if needed, or relative
            // Here we return relative API path which frontend should handle or prepend backend URL
            const fileUrl = `/api/media/${filename}`;
            console.log('Returning URL:', fileUrl);

            return {
                url: fileUrl,
                filename: filename
            };
        } catch (err) {
            console.error('Upload Error:', err);
            request.log.error(err);
            throw fastify.httpErrors.internalServerError('Failed to process image');
        }
    });
};

export default uploadRoutes;
