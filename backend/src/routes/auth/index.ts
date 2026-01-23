import { FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET is not defined in .env");
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const authRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.post('/login', async (request, reply) => {
        try {
            const body = loginSchema.parse(request.body);

            // Find user in DB
            const user = await prisma.user.findUnique({
                where: { email: body.email }
            });

            // TODO: In production, verify hash: await bcrypt.compare(body.password, user.password)
            if (user && user.password === body.password) {
                // Generate Token
                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        name: user.name
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return {
                    success: true,
                    token,
                    user: {
                        name: user.name,
                        email: user.email,
                        role: user.role
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
