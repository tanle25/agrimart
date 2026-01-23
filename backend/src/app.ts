import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = Fastify({
    logger: true,
});

const start = async () => {
    try {
        // Register Plugins
        await app.register(cors, {
            origin: process.env.FRONTEND_URL || 'http://localhost:8000',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
            credentials: true
        });
        await app.register(sensible);
        await app.register(import('@fastify/multipart'), {
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB
            }
        });
        await app.register(import('@fastify/static'), {
            root: join(__dirname, '../public'),
            prefix: '/public/', // optional: default '/'
        });

        // Load Autoload (Plugins & Routes)
        await app.register(autoload, {
            dir: join(__dirname, 'plugins'),
        });

        await app.register(autoload, {
            dir: join(__dirname, 'routes'),
            options: { prefix: '/api' },
        });

        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await app.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

// Trigger restart for new Dashboard routes
start();
