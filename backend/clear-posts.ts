
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Clearing blog posts...');

    try {
        const { count } = await prisma.blogPost.deleteMany();
        console.log(`Deleted ${count} blog posts.`);
        console.log('✅ Blog posts cleared successfully.');
    } catch (error) {
        console.error('Error clearing blog posts:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
