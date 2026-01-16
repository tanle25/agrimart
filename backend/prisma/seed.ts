import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Data interfaces
interface Province {
    Id: string;
    Name: string;
    Districts: District[];
}

interface District {
    Id: string;
    Name: string;
    Wards: Ward[];
}

interface Ward {
    Id: string;
    Name: string;
    Level: string;
}

async function seedLocations() {
    console.log('Start seeding locations...');

    try {
        // 1. Fetch data
        console.log('Fetching data from API...');
        const response = await fetch('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json');
        if (!response.ok) throw new Error('Failed to fetch location data');
        const data = await response.json() as Province[];

        console.log(`Fetched ${data.length} provinces.`);

        // 2. Clear existing data if needed (commented out for safety)
        // await prisma.ward.deleteMany();
        // await prisma.district.deleteMany();
        // await prisma.province.deleteMany();

        // 3. Seed Provinces
        for (const p of data) {
            // Upsert Province
            await prisma.province.upsert({
                where: { code: p.Id },
                update: { name: p.Name, fullName: p.Name },
                create: { code: p.Id, name: p.Name, fullName: p.Name }
            });

            // Seed Districts
            for (const d of p.Districts) {
                await prisma.district.upsert({
                    where: { code: d.Id },
                    update: { name: d.Name, fullName: d.Name, provinceCode: p.Id },
                    create: { code: d.Id, name: d.Name, fullName: d.Name, provinceCode: p.Id }
                });

                // Seed Wards
                if (d.Wards && Array.isArray(d.Wards)) {
                    const validWards = d.Wards.filter(w => w && w.Id && w.Name);
                    const wardOperations = validWards.map(w =>
                        prisma.ward.upsert({
                            where: { code: w.Id },
                            update: { name: w.Name, fullName: `${w.Level} ${w.Name}`, districtCode: d.Id },
                            create: { code: w.Id, name: w.Name, fullName: `${w.Level} ${w.Name}`, districtCode: d.Id }
                        })
                    );
                    await Promise.all(wardOperations);
                }
            }
            console.log(`Seeded province: ${p.Name}`);
        }

        console.log('Location seeding completed.');
    } catch (error) {
        console.error('Error seeding locations:', error);
    }
}

const BLOG_CATEGORIES = ["Mẹo vặt", "Sức khỏe", "Nông nghiệp", "Ẩm thực", "Kiến thức"];

const PRODUCT_CATEGORIES = [
    { name: 'Rau củ sạch', slug: 'rau-cu', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300' },
    { name: 'Trái cây tươi', slug: 'trai-cay', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=300' },
    { name: 'Thịt & Trứng', slug: 'thit-trung', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=300' },
    { name: 'Đồ khô & Hạt', slug: 'do-kho', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300' },
    { name: 'Lương thực', slug: 'luong-thuc', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300' },
];

// V2 Interfaces
interface ProvinceV2Data {
    code: number;
    name: string;
    codename: string;
    wards: WardV2Data[];
}

interface WardV2Data {
    code: number;
    name: string;
    codename: string;
    province_code: number;
}

async function seedLocationsV2() {
    console.log('Start seeding locations V2 (2025 Standard)...');

    try {
        // 1. Fetch Province List
        console.log('Fetching V2 Province list...');
        const resList = await fetch('https://provinces.open-api.vn/api/v2/p/');
        if (!resList.ok) throw new Error('Failed to fetch V2 province list');
        const provinceList = await resList.json() as ProvinceV2Data[];

        console.log(`Fetched ${provinceList.length} provinces (V2).`);

        for (const pSummary of provinceList) {
            // 2. Fetch Details (with Wards)
            // Note: API V2 might need individual fetch for depth=2 if list doesn't return wards
            const resDetail = await fetch(`https://provinces.open-api.vn/api/v2/p/${pSummary.code}?depth=2`);
            if (!resDetail.ok) {
                console.error(`Failed to fetch V2 details for province ${pSummary.code}`);
                continue;
            }
            const p = await resDetail.json() as ProvinceV2Data;

            // Upsert ProvinceV2
            await prisma.provinceV2.upsert({
                where: { code: String(p.code) },
                update: {
                    name: p.name,
                    fullName: p.name,
                    codename: p.codename
                },
                create: {
                    code: String(p.code),
                    name: p.name,
                    fullName: p.name,
                    codename: p.codename
                }
            });

            // Seed WardsV2
            if (p.wards && Array.isArray(p.wards)) {
                const wardOperations = p.wards.map(w =>
                    prisma.wardV2.upsert({
                        where: { code: String(w.code) },
                        update: {
                            name: w.name,
                            fullName: w.name,
                            codename: w.codename,
                            provinceCode: String(p.code)
                        },
                        create: {
                            code: String(w.code),
                            name: w.name,
                            fullName: w.name,
                            codename: w.codename,
                            provinceCode: String(p.code)
                        }
                    })
                );
                await Promise.all(wardOperations);
            }
            console.log(`Seeded V2 province: ${p.name}`);
        }
        console.log('Location seeding V2 completed.');

    } catch (error) {
        console.error('Error seeding locations V2:', error);
    }
}

async function main() {
    console.log('🌱 Starting seeding...');

    // Seed Locations V1
    await seedLocations();

    // Seed Locations V2
    await seedLocationsV2();

    // Seed Blog Categories
    console.log('--- Seeding Blog Categories ---');
    for (const catName of BLOG_CATEGORIES) {
        const slug = catName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        await prisma.blogCategory.upsert({
            where: { slug },
            update: {}, // If exists, do nothing
            create: {
                name: catName,
                slug: slug
            }
        });
        console.log(`Ensured category: ${catName}`);
    }

    // Seed Product Categories
    console.log('--- Seeding Product Categories ---');
    for (const cat of PRODUCT_CATEGORIES) {
        await prisma.productCategory.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                image: cat.image
            }
        });
        console.log(`Ensured product category: ${cat.name}`);
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
