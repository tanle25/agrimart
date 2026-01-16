
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.productCategory.count();
    console.log(`ProductCategory count: ${count}`);
    const all = await prisma.productCategory.findMany();
    console.log(JSON.stringify(all, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
