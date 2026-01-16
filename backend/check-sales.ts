
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        const product = await prisma.product.findFirst({
            where: { name: { contains: "Gạo ST25" } },
            include: { variants: true }
        });

        if (product) {
            console.log("Product found:", product.name);
            console.log("Price:", product.price);
            console.log("Old Price:", product.oldPrice);
            console.log("Sale Price:", product.salePrice);
            console.log("Variants:", JSON.stringify(product.variants, null, 2));
        } else {
            console.log("Product not found");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
