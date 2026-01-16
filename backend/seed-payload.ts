
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding from payload.txt...');

    const payloadPath = path.join(process.cwd(), '../payload.txt');
    if (!fs.existsSync(payloadPath)) {
        console.error('❌ payload.txt not found at', payloadPath);
        return;
    }

    const content = fs.readFileSync(payloadPath, 'utf-8');

    // Split by sections roughly
    const sections = {
        'product': '',
        'product category': '',
        'post': '',
        'post category': ''
    };

    const lines = content.split('\n');
    let currentSection: string | null = null;
    let buffer: string[] = [];

    const processBuffer = () => {
        if (currentSection && buffer.length > 0) {
            sections[currentSection as keyof typeof sections] = buffer.join('\n').trim();
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();
        const lower = trimmed.toLowerCase();

        if (lower === 'product' || lower === 'product category' || lower === 'post' || lower === 'post category') {
            processBuffer();
            currentSection = lower;
            buffer = [];
        } else if (currentSection) {
            buffer.push(line);
        }
    }
    processBuffer();

    // 1. Seed Product Categories
    if (sections['product category']) {
        try {
            const cats = JSON.parse(sections['product category']);
            console.log(`Processing ${cats.length} product categories...`);
            for (const c of cats) {
                await prisma.productCategory.upsert({
                    where: { slug: c.slug },
                    update: {},
                    create: {
                        name: c.name,
                        slug: c.slug,
                        image: c.image,
                        description: c.description
                    }
                });
            }
            console.log('✅ Product Categories seeded.');
        } catch (e) {
            console.error('❌ Error parsing product tags:', e);
        }
    }

    // 2. Seed Blog Categories
    if (sections['post category']) {
        try {
            const cats = JSON.parse(sections['post category']);
            console.log(`Processing ${cats.length} post categories...`);
            for (const c of cats) {
                await prisma.blogCategory.upsert({
                    where: { slug: c.slug },
                    update: {},
                    create: {
                        name: c.name,
                        slug: c.slug
                    }
                });
            }
            console.log('✅ Blog Categories seeded.');
        } catch (e) {
            console.error('❌ Error parsing post categories:', e);
        }
    }

    // 3. Seed Products
    if (sections['product']) {
        try {
            // Remove any leading/trailing non-json chars if needed
            const jsonStr = sections['product'].replace(/^product\s*/i, '');
            const p = JSON.parse(jsonStr);
            console.log(`Seeding product: ${p.name}`);

            await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    oldPrice: p.oldPrice,
                    image: p.images?.[0] || '',
                    images: p.images || [],
                    category: p.category,
                    description: p.description,
                    content: p.content,
                    type: p.type,
                    vendor: p.vendor,
                    tags: p.tags || [],
                    sku: p.sku,
                    barcode: p.barcode,
                    stock: p.stock,
                    weight: p.weight ? Number(p.weight) : null,
                    seoTitle: p.seoTitle,
                    seoDesc: p.seoDescription,
                    mainKeyword: p.mainKeyword,
                    status: p.status || 'active',
                    attributes: p.attributes || [],
                    variants: {
                        create: (p.variants || []).map((v: any) => ({
                            name: Object.values(v.attributes || {}).join(' - '),
                            price: v.price,
                            salePrice: v.salePrice,
                            stock: v.stock,
                            sku: v.sku,
                            image: v.image,
                            attributes: v.attributes
                        }))
                    }
                }
            });
            console.log('✅ Product seeded.');
        } catch (e) {
            console.error('❌ Error seeding product:', e);
        }
    }

    // 4. Seed Posts
    if (sections['post']) {
        try {
            const jsonStr = sections['post'];
            const p = JSON.parse(jsonStr);
            console.log(`Seeding post: ${p.title}`);

            await prisma.blogPost.create({
                data: {
                    title: p.title,
                    slug: p.slug,
                    excerpt: p.excerpt,
                    content: p.content,
                    image: p.image,
                    category: p.category,
                    author: p.author,
                    tags: p.tags || [],
                    featured: p.featured || false,
                    seoTitle: p.seoTitle,
                    seoDesc: p.seoDesc,
                    mainKeyword: p.mainKeyword,
                    date: new Date().toISOString()
                }
            });
            console.log('✅ Post seeded.');
        } catch (e) {
            console.error('❌ Error seeding post:', e);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
