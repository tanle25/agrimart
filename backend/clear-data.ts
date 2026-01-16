
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Clearing data...');

    try {
        // Delete Products (Variants cascade automatically)
        const { count: productCount } = await prisma.product.deleteMany();
        console.log(`Deleted ${productCount} products.`);

        // Delete Blog Posts
        const { count: postCount } = await prisma.blogPost.deleteMany();
        console.log(`Deleted ${postCount} blog posts.`);

        console.log('✅ Data cleared successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
