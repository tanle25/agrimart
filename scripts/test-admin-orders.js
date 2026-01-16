

const BASE_URL = 'http://localhost:8001/api/orders';

async function testAdminOrders() {
    console.log('--- Testing Admin Order Endpoints ---');

    console.log('\n1. Testing GET /api/orders (Pagination)');
    try {
        const res = await fetch(`${BASE_URL}?page=1&limit=5`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Pagination:', data.pagination);
        console.log('Items Count:', data.data.length);

        if (data.data.length > 0) {
            const orderId = data.data[0].id;
            console.log(`\n2. Testing PUT /api/orders/${orderId}/status`);

            const updateRes = await fetch(`${BASE_URL}/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'processing' })
            });
            const updateData = await updateRes.json();
            console.log('Update Status:', updateRes.status);
            console.log('New Status:', updateData.status);

            // Revert status to pending for testing re-runnability (optional)
            // await fetch(`${BASE_URL}/${orderId}/status`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status: 'pending' })
            // });
        } else {
            console.log('No orders to test update.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAdminOrders();
