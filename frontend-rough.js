// test-services.js
// Tests all UserService and ProductService endpoints via Gateway
// Run: node test-services.js

const GATEWAY = 'http://62.238.15.118:8000';
const USER_SERVICE_DIRECT = 'http://62.238.15.118:8200'; // for token only

const CLIENT_ID     = 'productService';
const CLIENT_SECRET = 'productServiceSecret';

// ── Auth ─────────────────────────────────────────────────────────
function basicAuth() {
    return 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
}

async function getToken() {
    const res = await fetch(`${USER_SERVICE_DIRECT}/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': basicAuth(),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=openid'
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Failed to get token: ' + JSON.stringify(data));
    console.log('✅ Token obtained\n');
    return data.access_token;
}

// ── Helpers ───────────────────────────────────────────────────────
async function call(label, method, path, token, body) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    console.log(`\n─── ${label} ───`);
    console.log(`${method} ${GATEWAY}${path}`);

    try {
        const res = await fetch(`${GATEWAY}${path}`, options);
        const text = await res.text();
        let parsed;
        try { parsed = JSON.parse(text); } catch { parsed = text; }
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(parsed, null, 2));
        return parsed;
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
    const token = await getToken();

    // ── USER SERVICE ─────────────────────────────────────────────

    // 1. Signup
    const signupRes = await call(
        'POST /v1/auth/signup',
        'POST', '/v1/auth/signup', token,
        { email: 'testuser@example.com', password: 'Test@1234' }
    );

    // 2. Change password
    await call(
        'POST /v1/auth/password',
        'POST', '/v1/auth/password', token,
        { oldPassword: 'Test@1234', newPassword: 'NewPass@5678' }
    );

    // 3. Create role
    const roleRes = await call(
        'POST /v1/roles',
        'POST', '/v1/roles', token,
        { role: 'ROLE_TESTER' }
    );

    // 4. Get roles
    await call('GET /v1/roles', 'GET', '/v1/roles', token);

    // 5. Get user by ID (use id from signup if available)
    const userId = signupRes?.id || 1;
    await call(`GET /v1/users/${userId}`, 'GET', `/v1/users/${userId}`, token);

    // 6. Set roles for user
    const roleId = roleRes?.id || 1;
    await call(
        `POST /v1/users/${userId}/roles`,
        'POST', `/v1/users/${userId}/roles`, token,
        { roleIds: [roleId] }
    );

    // ── PRODUCT SERVICE ──────────────────────────────────────────

    // 7. Create product
    const productRes = await call(
        'POST /v1/products',
        'POST', '/v1/products', token,
        {
            title: 'Test Product',
            description: 'A test product description',
            price: 99.99,
            image: 'https://via.placeholder.com/150',
            category: 'Electronics'
        }
    );

    // 8. Get all products
    //await call('GET /v1/products', 'GET', '/v1/products', token);

    // 9. Get product by ID
    const productId = productRes?.id || 1;
    await call(`GET /v1/products/${productId}`, 'GET', `/v1/products/${productId}`, token);

    // 10. Update product
    await call(
        `PATCH /v1/products/${productId}`,
        'PATCH', `/v1/products/${productId}`, token,
        {
            title: 'Updated Test Product',
            price: 79.99
        }
    );

    // 11. Search products
    await call(
        'POST /v1/products/search',
        'POST', '/v1/products/search', token,
        {
            keywords: 'test',
            category: 'Electronics',
            page: 0,
            size: 10,
            sort: 'price'
        }
    );

    // 12. Delete product
    await call(`DELETE /v1/products/${productId}`, 'DELETE', `/v1/products/${productId}`, token);

    console.log('\n\n✅ All tests complete');
}

main().catch(console.error);