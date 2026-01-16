
const fetch = require('node-fetch');

async function testOrderCreation() {
    const BACKEND_URL = 'http://localhost:3000'; // Assuming Next.js proxies or backend is on 3000/api or similar. 
    // Wait, the project structure has `backend/src/routes`. Is it a separate server or Next.js API routes?
    // Looking at previous context: "Backend - API (backend/src/routes/orders/index.ts)".
    // And CheckoutPage uses: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

    const API_URL = 'http://localhost:3001/api/orders';

    const payload = {
        customerName: "Test User",
        customerPhone: "0123456789",
        customerEmail: "test@example.com",
        shippingAddress: "123 Test St",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        ward: "P. Bến Nghé",
        note: "Test order",
        paymentMethod: "cod",
        items: [
            // I need valid product IDs. I'll pick some from the DB or mock data if they match.
            // Since I don't know exact IDs, this might be tricky.
            // I should fetch products first.
        ]
    };

    // Actually, let's try to fetch products first to get a valid ID.
    try {
        const prodRes = await fetch('http://localhost:3001/api/products?limit=1');
        const prods = await prodRes.json();

        if (!prods.products || prods.products.length === 0) {
            console.log("No products found to test with.");
            return;
        }

        const product = prods.products[0];
        console.log("Found product:", product.id, product.name);

        payload.items.push({
            productId: product.id,
            quantity: 1,
            // variantId: ... if needed
        });

        console.log("Sending payload:", JSON.stringify(payload, null, 2));

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Response status:", res.status);
        console.log("Response data:", data);

        if (res.ok) {
            console.log("✅ Order created successfully!");
        } else {
            console.error("❌ Order creation failed.");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

testOrderCreation();
