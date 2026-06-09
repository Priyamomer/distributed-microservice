// check-order-status.js
// Usage: node check-order-status.js <orderId>

const HOST      = process.env.HOST      || 'http://62.238.15.118:30000';
const AUTH_HOST = process.env.AUTH_HOST || 'http://62.238.15.118:30200';
const USER_ID   = '1';

const green = s => `\x1b[32m${s}\x1b[0m`;
const red   = s => `\x1b[31m${s}\x1b[0m`;
const cyan  = s => `\x1b[36m${s}\x1b[0m`;
const dim   = s => `\x1b[2m${s}\x1b[0m`;
const bold  = s => `\x1b[1m${s}\x1b[0m`;

const orderId = process.argv[2];
if (!orderId) {
    console.error(red('Usage: node check-order-status.js <orderId>'));
    process.exit(1);
}

async function getToken() {
    const res  = await fetch(`${AUTH_HOST}/oauth2/token`, {
        method:  'POST',
        headers: {
            Authorization:  'Basic ' + Buffer.from('productService:productServiceSecret').toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=openid',
    });
    const data = await res.json();
    return data.access_token;
}

async function run() {
    const token = await getToken();
    const res   = await fetch(`${HOST}/v1/orders/${USER_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await res.json();
    const order  = orders.find(o => String(o.orderId) === String(orderId));

    if (!order) {
        console.log(red(`✗ Order ${orderId} not found`));
        process.exit(1);
    }

    const statusColor = order.orderStatus === 'PAYMENT_SUCCESS' ? green : cyan;
    console.log(bold(`\nOrder ${orderId} Status:`));
    console.log(`  ${statusColor(order.orderStatus)}`);
    console.log(dim(`  userId: ${order.userId}`));
    console.log(dim(`  items:  ${order.orderItemList?.length ?? 0}\n`));
}

run().catch(err => {
    console.error(red('Error: ' + err.message));
    process.exit(1);
});