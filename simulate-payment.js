// simulate-payment.js
// Programmatically completes a Stripe test payment and checks order status.
//
// Usage:
//   STRIPE_API_KEY=sk_test_xxx node simulate-payment.js <orderId>

const HOST      = process.env.HOST      || 'http://62.238.15.118:30000';
const AUTH_HOST = process.env.AUTH_HOST || 'http://62.238.15.118:30200';
const STRIPE_KEY = process.env.STRIPE_API_KEY;
if (!STRIPE_KEY) { console.error('Set STRIPE_API_KEY env var'); process.exit(1); }
const USER_ID   = '1';

const green = s => `\x1b[32m${s}\x1b[0m`;
const red   = s => `\x1b[31m${s}\x1b[0m`;
const cyan  = s => `\x1b[36m${s}\x1b[0m`;
const dim   = s => `\x1b[2m${s}\x1b[0m`;
const bold  = s => `\x1b[1m${s}\x1b[0m`;

const orderId = process.argv[2];
if (!orderId) {
    console.error(red('Usage: node simulate-payment.js <orderId>'));
    process.exit(1);
}

async function stripeReq(method, path, body) {
    const headers = {
        Authorization:  'Basic ' + Buffer.from(`${STRIPE_KEY}:`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    const opts = { method, headers };
    if (body) opts.body = new URLSearchParams(body).toString();
    const res  = await fetch(`https://api.stripe.com/v1${path}`, opts);
    return res.json();
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
    if (!data.access_token) throw new Error('Token failed: ' + JSON.stringify(data));
    return data.access_token;
}

async function run() {
    console.log(bold(cyan('\n⚡  Simulate Stripe Payment\n')));

    // ── Step 1: Create PaymentIntent ──────────────────────────────
    console.log(bold('── Step 1: Create PaymentIntent ──'));
    const pi = await stripeReq('POST', '/payment_intents', {
        amount:                   9999,
        currency:                 'inr',
        'payment_method_types[]': 'card',
        'metadata[OrderId]':      orderId,
        confirm:                  false,
    });
    if (pi.error) {
        console.log(red(`✗ ${pi.error.message}`));
        process.exit(1);
    }
    console.log(green(`✓ PaymentIntent created → ${pi.id}`));
    console.log(dim(`   status: ${pi.status}\n`));

    // ── Step 2: Confirm with pm_card_visa ────────────────────────
    console.log(bold('── Step 2: Confirm with test card ──'));
    const confirmed = await stripeReq('POST', `/payment_intents/${pi.id}/confirm`, {
        payment_method: 'pm_card_visa',
        return_url:     'https://example.com',
    });

    if (confirmed.error) {
        console.log(red(`✗ ${confirmed.error.message}`));
        process.exit(1);
    }
    console.log(green(`✓ Confirm response received`));
    console.log(dim(`   status: ${confirmed.status}\n`));

    // ── Step 3: Handle 3DS if required ───────────────────────────
    if (confirmed.status === 'requires_action' && confirmed.next_action?.redirect_to_url?.url) {
        console.log(bold('── Step 3: Completing 3DS authentication ──'));
        const authUrl = confirmed.next_action.redirect_to_url.url;
        console.log(dim(`   auth url: ${authUrl}`));
        // In test mode, fetching the URL with ?authorize=true auto-completes 3DS
        const authRes = await fetch(authUrl + (authUrl.includes('?') ? '&' : '?') + 'authorize=true', {
            redirect: 'follow',
        });
        console.log(dim(`   auth response: ${authRes.status} ${authRes.url}`));

        // Re-fetch the payment intent to check final status
        const finalPi = await stripeReq('GET', `/payment_intents/${pi.id}`, null);
        console.log(green(`✓ 3DS completed`));
        console.log(dim(`   final status: ${finalPi.status}\n`));
    }

    // ── Step 4: Wait for webhook to process ───────────────────────
    console.log(bold('── Step 4: Waiting 5s for webhook to process... ──'));
    await new Promise(r => setTimeout(r, 5000));

    // ── Step 5: Check order status ────────────────────────────────
    console.log(bold('── Step 5: Check Order Status ──'));
    const token    = await getToken();
    const res      = await fetch(`${HOST}/v1/orders/${USER_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const orders   = await res.json();
    const order    = orders.find(o => String(o.orderId) === String(orderId));

    if (!order) {
        console.log(red(`✗ Order ${orderId} not found`));
        process.exit(1);
    }

    const isSuccess = order.orderStatus === 'PAYMENT_SUCCESS';
    const statusStr = isSuccess ? green(order.orderStatus) : cyan(order.orderStatus);
    console.log(isSuccess ? green('✓ Order status updated!') : red('✗ Order status not yet updated'));
    console.log(dim(`   orderId     → ${order.orderId}`));
    console.log(`   orderStatus → ${statusStr}\n`);
}

run().catch(err => {
    console.error(red('Error: ' + err.message));
    process.exit(1);
});