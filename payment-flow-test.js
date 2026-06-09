// payment-flow-test.js
// Flow: get token → create order → create payment link → check order status
//
// Usage:
//   node payment-flow-test.js

const HOST      = process.env.HOST      || 'http://62.238.15.118:30000';
const AUTH_HOST = process.env.AUTH_HOST || 'http://62.238.15.118:30200';

const CLIENT_ID     = 'productService';
const CLIENT_SECRET = 'productServiceSecret';
const TEST_USER_ID  = '1';

const green  = s => `\x1b[32m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const cyan   = s => `\x1b[36m${s}\x1b[0m`;
const bold   = s => `\x1b[1m${s}\x1b[0m`;
const dim    = s => `\x1b[2m${s}\x1b[0m`;

async function getToken() {
    const res  = await fetch(`${AUTH_HOST}/oauth2/token`, {
        method:  'POST',
        headers: {
            Authorization:  'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=openid',
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Failed to get token: ' + JSON.stringify(data));
    return data.access_token;
}

async function req(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${HOST}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
}

async function run() {
    console.log(bold(cyan('\n⚡  Payment Flow Test')));
    console.log(dim(`   Host: ${HOST}\n`));

    // ── Step 1: Get Token ─────────────────────────────────────────
    console.log(bold('── Step 1: Get Auth Token ──'));
    const token = await getToken();
    console.log(green('✓ Token acquired\n'));

    // ── Step 2: Create Order ──────────────────────────────────────
    console.log(bold('── Step 2: Create Order ──'));
    const orderBody = {
        userId: TEST_USER_ID,
        orderItemList: [
            { productId: 'prod_test_001', quantity: 1 },
        ],
    };
    const orderRes = await req('POST', '/v1/orders', { token, body: orderBody });
    if (orderRes.status !== 200) {
        console.log(red(`✗ Failed to create order — HTTP ${orderRes.status}`));
        console.log(dim(JSON.stringify(orderRes.data, null, 2)));
        process.exit(1);
    }
    const orderId = orderRes.data.orderId;
    const orderStatus = orderRes.data.orderStatus;
    console.log(green(`✓ Order created`));
    console.log(dim(`   orderId     → ${orderId}`));
    console.log(dim(`   orderStatus → ${orderStatus}\n`));

    // ── Step 3: Create Payment Link ───────────────────────────────
    console.log(bold('── Step 3: Create Payment Link ──'));
    const paymentBody = {
        orderId:    String(orderId),
        amount:     9999,
        phonNumber: '9876543210',
        email:      'test@example.com',
    };
    const payRes = await req('POST', '/v1/payments', { token, body: paymentBody });
    if (payRes.status !== 200) {
        console.log(red(`✗ Failed to create payment link — HTTP ${payRes.status}`));
        console.log(dim(JSON.stringify(payRes.data, null, 2)));
        process.exit(1);
    }
    const paymentLink = payRes.data;
    console.log(green('✓ Payment link created'));
    console.log(`\n   ${bold('👉 Open this URL to complete payment:')}`);
    console.log(`   ${cyan(paymentLink)}\n`);

    // ── Step 4: Check Order Status ────────────────────────────────
    console.log(bold('── Step 4: Current Order Status ──'));
    const ordersRes = await req('GET', `/v1/orders/${TEST_USER_ID}`, { token });
    if (ordersRes.status !== 200) {
        console.log(red(`✗ Failed to fetch orders — HTTP ${ordersRes.status}`));
        process.exit(1);
    }
    const orders = ordersRes.data;
    const thisOrder = orders.find(o => String(o.orderId) === String(orderId));
    if (!thisOrder) {
        console.log(red(`✗ Order ${orderId} not found in response`));
        process.exit(1);
    }
    console.log(green(`✓ Order status fetched`));
    console.log(dim(`   orderId     → ${thisOrder.orderId}`));
    console.log(dim(`   orderStatus → ${thisOrder.orderStatus}`));

    console.log(`\n${bold('──────────────────────────────────────────')}`);
    console.log(`Complete the payment at the URL above, then run:`);
    console.log(cyan(`   node check-order-status.js ${orderId}`));
    console.log(`to verify the status updated to PAYMENT_SUCCESS.\n`);
}

run().catch(err => {
    console.error(red('Error: ' + err.message));
    process.exit(1);
});