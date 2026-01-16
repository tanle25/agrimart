
import prisma from './src/services/db.js';

async function testPriceRange() {
    console.log('--- Testing Price Range Logic ---');

    // 1. Check Price Range Endpoint Logic (Emulated)
    const maxSimpleProduct = await prisma.product.findFirst({
        where: { type: 'simple', status: 'active' },
        orderBy: { price: 'desc' },
        select: { price: true }
    });
    const maxVariant = await prisma.variant.findFirst({
        where: { product: { status: 'active' } },
        orderBy: { price: 'desc' },
        select: { price: true }
    });

    const maxSimple = maxSimpleProduct?.price || 0;
    const maxVar = maxVariant?.price || 0;
    console.log(`Max Simple Price: ${maxSimple}`);
    console.log(`Max Variant Price: ${maxVar}`);
    console.log(`Calculated Global Max: ${Math.max(maxSimple, maxVar)}`);

    // 2. Check Product Filtering Logic (Emulated)
    // Let's search for products in specific range
    const min = 0;
    const max = 50000;

    console.log(`\nSearching for products between ${min} and ${max}...`);

    const products = await prisma.product.findMany({
        where: {
            AND: [
                { status: 'active' },
                {
                    OR: [
                        { type: 'simple', price: { gte: min, lte: max } },
                        {
                            type: 'variable',
                            variants: {
                                some: {
                                    OR: [
                                        { salePrice: { gt: 0, gte: min, lte: max } },
                                        { OR: [{ salePrice: 0 }, { salePrice: null }], price: { gte: min, lte: max } }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        include: { variants: true }
    });

    console.log(`Found ${products.length} products in range.`);
    products.forEach(p => {
        if (p.type === 'simple') {
            console.log(`- [Simple] ${p.name}: ${p.price}`);
        } else {
            console.log(`- [Variable] ${p.name}`);
            p.variants.forEach(v => {
                const effectivePrice = (v.salePrice && v.salePrice > 0) ? v.salePrice : v.price;
                const inRange = effectivePrice >= min && effectivePrice <= max;
                console.log(`  > Variant ${v.name}: ${v.price} (Sale: ${v.salePrice}) [Effective: ${effectivePrice}] ${inRange ? '(*)' : ''}`);
            });
        }
    });
}

testPriceRange()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
