import { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'agrimart-secret-key-change-me';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const authRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.post('/login', async (request, reply) => {
        try {
            const body = loginSchema.parse(request.body);

            // TODO: Replace with Real Database Check
            // Hardcoded credentials for MVP phase
            const VALID_EMAIL = 'admin@agrimart.vn';
            const VALID_PASS = 'admin123';

            if (body.email === VALID_EMAIL && body.password === VALID_PASS) {
                // Generate Token
                const token = jwt.sign(
                    {
                        id: 1,
                        email: body.email,
                        role: 'admin',
                        name: 'System Admin'
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return {
                    success: true,
                    token,
                    user: {
                        name: 'System Admin',
                        email: body.email,
                        role: 'admin'
                    }
                };
            }

            return reply.code(401).send({
                success: false,
                message: 'Thông tin đăng nhập không chính xác'
            });

        } catch (error) {
            return reply.code(400).send({
                success: false,
                message: 'Dữ liệu không hợp lệ'
            });
        }
    });
};

export default authRoutes;
