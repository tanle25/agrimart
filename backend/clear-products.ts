
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Clearing products...');

    try {
        // Delete Products (Variants cascade automatically)
        const { count: productCount } = await prisma.product.deleteMany();
        console.log(`Deleted ${productCount} products.`);

        console.log('✅ Products cleared successfully.');
    } catch (error) {
        console.error('Error clearing products:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
