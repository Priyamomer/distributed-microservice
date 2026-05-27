// all-api-endpoint-testing.js
// Tests all 22 REST API endpoints across all 6 microservices
//
// Usage:
//   node all-api-endpoint-testing.js
//   HOST=http://localhost:8000 TEST_USER_ID=1 node all-api-endpoint-testing.js

const fs = require('fs').promises;

// All business API requests go through the Gateway (NodePort 30000)
const HOST          = process.env.HOST          || 'http://62.238.15.118:30000';
// OAuth2 token must be fetched directly from User Service (NodePort 30200)
const AUTH_HOST     = process.env.AUTH_HOST     || 'http://62.238.15.118:30200';
const CLIENT_ID     = process.env.CLIENT_ID     || 'productService';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'productServiceSecret';

// TEST_USER_ID is needed for GET /v1/users/{id} and POST /v1/users/{id}/roles
// because the signup response does NOT return the user's numeric ID.
// Set this to a known user ID in your database, or leave as 1 for first user.
const TEST_USER_ID = parseInt(process.env.TEST_USER_ID || '1');

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const R       = '\x1b[0m';
const green   = s => `\x1b[32m${s}${R}`;
const red     = s => `\x1b[31m${s}${R}`;
const yellow  = s => `\x1b[33m${s}${R}`;
const cyan    = s => `\x1b[36m${s}${R}`;
const bold    = s => `\x1b[1m${s}${R}`;
const dim     = s => `\x1b[2m${s}${R}`;

let passed = 0, failed = 0;

// ── Per-run tracking (for status_api.md) ──────────────────────────────────────
const serviceResults  = [];   // [{ name, endpoints: [{ method, path, assertPassed, assertFailed }] }]
let   currentService  = null;
let   currentEndpoint = null;

// ── Utilities ─────────────────────────────────────────────────────────────────

function randomEmail() {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 99999)}@test.com`;
}

async function req(method, path, { body, token, rawBody, contentType } = {}) {
  const url  = `${HOST}${path}`;
  const hdrs = { 'Content-Type': contentType || 'application/json' };
  if (token) hdrs['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers: hdrs };
  if (rawBody !== undefined) {
    opts.body = rawBody;
  } else if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const t0  = Date.now();
  const res = await fetch(url, opts);
  const ms  = Date.now() - t0;

  const ct = res.headers.get('content-type') || '';
  let data;
  try {
    data = ct.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, ms, data };
}

function pass(label, detail = '') {
  passed++;
  if (currentEndpoint) currentEndpoint.assertPassed++;
  console.log(`    ${green('✓')} ${label}${detail ? dim('  — ' + detail) : ''}`);
}

function fail(label, detail = '') {
  failed++;
  if (currentEndpoint) currentEndpoint.assertFailed++;
  console.log(`    ${red('✗')} ${label}${detail ? dim('  — ' + detail) : ''}`);
}

function assert(label, condition, detail = '') {
  condition ? pass(label, detail) : fail(label, detail);
}

function info(msg) {
  console.log(dim(`      ${msg}`));
}

function section(title, port, name) {
  currentService = { name: name || title, endpoints: [] };
  serviceResults.push(currentService);
  console.log(`\n${bold(cyan('━━━ ' + title + ' ━━━'))}  ${dim('port ' + port)}`);
}

function endpoint(method, path) {
  currentEndpoint = { method, path, assertPassed: 0, assertFailed: 0 };
  if (currentService) currentService.endpoints.push(currentEndpoint);
  const colors = { GET: cyan, POST: green, PATCH: yellow, DELETE: red };
  const col    = colors[method] || (s => s);
  console.log(`\n  ${bold(col(method.padEnd(7)))} ${path}`);
}

// ── OAuth2 token ──────────────────────────────────────────────────────────────

async function getToken() {
  const res = await fetch(`${AUTH_HOST}/oauth2/token`, {
    method : 'POST',
    headers: {
      Authorization   : 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type'  : 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=openid',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  console.log(`  ${green('✓')} OAuth2 token acquired  ${dim('(client_credentials / openid)')}`);
  return data.access_token;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. USER SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testUserService(token) {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');

  // ── POST /v1/auth/signup ──────────────────────────────────────────────────
  endpoint('POST', '/v1/auth/signup');
  info('Request body: { email: String, password: String }');
  info('Expected response: { email: String, roles: Array }');

  const email = randomEmail();
  const r1    = await req('POST', '/v1/auth/signup', {
    token,
    body: { email, password: 'Test@1234' },
  });
  assert('HTTP 200',                  r1.status === 200,                   `got ${r1.status}  ${r1.ms}ms`);
  assert('response.email matches',    r1.data?.email === email);
  assert('response.roles is array',   Array.isArray(r1.data?.roles));
  info(`response → ${JSON.stringify(r1.data)}`);

  // ── POST /v1/auth/password ────────────────────────────────────────────────
  endpoint('POST', '/v1/auth/password');
  info('Request body: { email: String, oldPassword: String, newPassword: String }');
  info('Expected response: String (success/failure message)');

  const r2 = await req('POST', '/v1/auth/password', {
    token,
    body: { email, oldPassword: 'Test@1234', newPassword: 'NewTest@5678' },
  });
  assert('HTTP 200',               r2.status === 200,              `got ${r2.status}  ${r2.ms}ms`);
  assert('response is a string',   typeof r2.data === 'string');
  info(`response → "${r2.data}"`);

  // ── POST /v1/roles ────────────────────────────────────────────────────────
  endpoint('POST', '/v1/roles');
  info('Request body: { name: String }');
  info('Expected response: { id: Long, role: String }');

  const roleName = `ROLE_TEST_${Date.now()}`;
  const r3       = await req('POST', '/v1/roles', {
    token,
    body: { name: roleName },
  });
  assert('HTTP 200',                    r3.status === 200,              `got ${r3.status}  ${r3.ms}ms`);
  assert('response.id exists',          r3.data?.id !== undefined);
  assert('response.role matches name',  r3.data?.role === roleName);
  const createdRoleId = r3.data?.id;
  info(`created role → ${JSON.stringify(r3.data)}`);

  // ── GET /v1/roles ─────────────────────────────────────────────────────────
  endpoint('GET', '/v1/roles');
  info('Request body: none');
  info('Expected response: Array<{ id: Long, role: String }>');

  const r4 = await req('GET', '/v1/roles', { token });
  assert('HTTP 200',                       r4.status === 200,                              `got ${r4.status}  ${r4.ms}ms`);
  assert('response is array',              Array.isArray(r4.data));
  assert('created role is in the list',    Array.isArray(r4.data) && r4.data.some(r => r.id === createdRoleId));
  info(`total roles returned → ${r4.data?.length}`);

  // ── GET /v1/users/{id} ────────────────────────────────────────────────────
  endpoint('GET', `/v1/users/${TEST_USER_ID}`);
  info(`Path variable: id = ${TEST_USER_ID}  (set TEST_USER_ID env to change)`);
  info('Request body: none');
  info('Expected response: { email: String, roles: Array<Role> }');

  const r5 = await req('GET', `/v1/users/${TEST_USER_ID}`, { token });
  assert('HTTP 200',                  r5.status === 200,                 `got ${r5.status}  ${r5.ms}ms`);
  assert('response.email is string',  typeof r5.data?.email === 'string');
  assert('response.roles is array',   Array.isArray(r5.data?.roles));
  info(`response → ${JSON.stringify(r5.data)}`);

  // ── POST /v1/users/{id}/roles ─────────────────────────────────────────────
  endpoint('POST', `/v1/users/${TEST_USER_ID}/roles`);
  info(`Path variable: id = ${TEST_USER_ID}`);
  info('Request body: { roleIds: Array<Long> }');
  info('Expected response: { email: String, roles: Array<Role> }');

  const r6 = await req('POST', `/v1/users/${TEST_USER_ID}/roles`, {
    token,
    body: { roleIds: [createdRoleId] },
  });
  assert('HTTP 200',                  r6.status === 200,                 `got ${r6.status}  ${r6.ms}ms`);
  assert('response.email is string',  typeof r6.data?.email === 'string');
  assert('response.roles is array',   Array.isArray(r6.data?.roles));
  info(`response → ${JSON.stringify(r6.data)}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PRODUCT SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testProductService(token) {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  let productId;

  // ── POST /v1/products ─────────────────────────────────────────────────────
  endpoint('POST', '/v1/products');
  info('Request body: { title, price: int, category, description, image, currency }');
  info('Expected response: { id, title, price, category, description, image, currency }');

  const newProduct = {
    title      : `Test Product ${Date.now()}`,
    price      : 999,
    category   : 'Electronics',
    description: 'API test suite product',
    image      : 'https://test.com/image.png',
    currency   : 'USD',
  };
  const r1 = await req('POST', '/v1/products', { token, body: newProduct });
  assert('HTTP 200',              r1.status === 200,                   `got ${r1.status}  ${r1.ms}ms`);
  assert('response.id exists',    r1.data?.id !== undefined);
  assert('title matches',         r1.data?.title === newProduct.title);
  assert('price matches',         r1.data?.price === newProduct.price);
  assert('currency matches',      r1.data?.currency === newProduct.currency);
  productId = r1.data?.id;
  info(`created productId → ${productId}`);

  // ── GET /v1/products ──────────────────────────────────────────────────────
  endpoint('GET', '/v1/products');
  info('Request body: none');
  info('Expected response: Array<{ id, title, price, category, description, image, currency }>');

  const r2 = await req('GET', '/v1/products', { token });
  assert('HTTP 200',              r2.status === 200,           `got ${r2.status}  ${r2.ms}ms`);
  assert('response is array',     Array.isArray(r2.data));
  assert('array is non-empty',    (r2.data?.length ?? 0) > 0);
  info(`total products returned → ${r2.data?.length}`);

  // ── GET /v1/products/{id} ─────────────────────────────────────────────────
  endpoint('GET', `/v1/products/${productId}`);
  info(`Path variable: id = "${productId}"  (captured from POST response)`);
  info('Request body: none');
  info('Expected response: { id, title, price, category, description, image, currency }');

  const r3 = await req('GET', `/v1/products/${productId}`, { token });
  assert('HTTP 200',           r3.status === 200,                     `got ${r3.status}  ${r3.ms}ms`);
  assert('id matches',         r3.data?.id === productId);
  assert('title matches',      r3.data?.title === newProduct.title);
  assert('price matches',      r3.data?.price === newProduct.price);
  info(`response → ${JSON.stringify(r3.data)}`);

  // ── PATCH /v1/products ────────────────────────────────────────────────────
  endpoint('PATCH', '/v1/products');
  info('Request body: { id (required — identifies product), title, price, category, description, image, currency }');
  info('Note: id goes in the body, NOT in the URL path');
  info('Expected response: { id, title, price, category, description, image, currency }  (updated)');

  const updatedTitle = `Updated Product ${Date.now()}`;
  const r4 = await req('PATCH', '/v1/products', {
    token,
    body: { ...newProduct, id: productId, title: updatedTitle, price: 1499 },
  });
  assert('HTTP 200',            r4.status === 200,            `got ${r4.status}  ${r4.ms}ms`);
  assert('title is updated',    r4.data?.title === updatedTitle);
  assert('price is updated',    r4.data?.price === 1499);
  info(`updated title → "${r4.data?.title}"  price → ${r4.data?.price}`);

  // ── POST /v1/products/search ──────────────────────────────────────────────
  endpoint('POST', '/v1/products/search');
  info('Request body: { query: String, pageNumber: int, itemsPerPage: int, sortParams: [{ sortParamName, sortType }] }');
  info('sortType values: "ASC" | "DESC"');
  info('Expected response: Page<Product> → { content: Array, totalElements, totalPages, size, number }');

  const r5 = await req('POST', '/v1/products/search', {
    token,
    body: {
      query       : 'test',
      pageNumber  : 0,
      itemsPerPage: 5,
      sortParams  : [{ sortParamName: 'price', sortType: 'ASC' }],
    },
  });
  assert('HTTP 200',                        r5.status === 200,                             `got ${r5.status}  ${r5.ms}ms`);
  assert('response.content is array',       Array.isArray(r5.data?.content));
  assert('response.totalElements exists',   typeof r5.data?.totalElements === 'number');
  assert('response.totalPages exists',      typeof r5.data?.totalPages === 'number');
  info(`hits → ${r5.data?.totalElements}  page ${r5.data?.number + 1}/${r5.data?.totalPages}`);

  // ── DELETE /v1/products/{id} ──────────────────────────────────────────────
  endpoint('DELETE', `/v1/products/${productId}`);
  info(`Path variable: id = "${productId}"`);
  info('Request body: none');
  info('Expected response: { id, title, price, ... }  (the deleted product object)');

  const r6 = await req('DELETE', `/v1/products/${productId}`, { token });
  assert('HTTP 200',                       r6.status === 200,               `got ${r6.status}  ${r6.ms}ms`);
  assert('returned deleted product id',    r6.data?.id === productId);
  info(`deleted product → ${JSON.stringify(r6.data)}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. CART SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testCartService(token) {
  section('3. CART SERVICE  (/v1/cart)  — backed by Redis', 8400, 'Cart Service');

  const userId    = '1';
  const productId = `prod_${Date.now()}`;

  // ── GET /v1/cart/{userId} ─────────────────────────────────────────────────
  endpoint('GET', `/v1/cart/${userId}`);
  info(`Path variable: userId = "${userId}"`);
  info('Request body: none');
  info('Expected response: { userId: String, itemDtoList: Array<{ productId, quantity }> }');

  const r1 = await req('GET', `/v1/cart/${userId}`, { token });
  assert('HTTP 200',                     r1.status === 200,                     `got ${r1.status}  ${r1.ms}ms`);
  assert('response.userId matches',      r1.data?.userId === userId);
  assert('response.itemDtoList is array',Array.isArray(r1.data?.itemDtoList));
  info(`cart for new user (empty) → ${JSON.stringify(r1.data)}`);

  // ── POST /v1/cart/{userId}/items ──────────────────────────────────────────
  endpoint('POST', `/v1/cart/${userId}/items`);
  info(`Path variable: userId = "${userId}"`);
  info('Request body: { productId: String, quantity: int }');
  info('Expected response: CartItem { id, productId, quantity }  (cart field is @JsonIgnore)');

  const r2 = await req('POST', `/v1/cart/${userId}/items`, {
    token,
    body: { productId, quantity: 2 },
  });
  assert('HTTP 200',                r2.status === 200,              `got ${r2.status}  ${r2.ms}ms`);
  assert('response.productId ok',   r2.data?.productId === productId);
  assert('response.quantity = 2',   r2.data?.quantity === 2);
  info(`added item → ${JSON.stringify(r2.data)}`);

  // ── PATCH /v1/cart/{userId}/items ─────────────────────────────────────────
  endpoint('PATCH', `/v1/cart/${userId}/items`);
  info(`Path variable: userId = "${userId}"`);
  info('Request body: { productId: String, quantity: int }  (new quantity replaces old)');
  info('Expected response: CartItem { id, productId, quantity }');

  const r3 = await req('PATCH', `/v1/cart/${userId}/items`, {
    token,
    body: { productId, quantity: 5 },
  });
  assert('HTTP 200',                r3.status === 200,              `got ${r3.status}  ${r3.ms}ms`);
  assert('response.productId ok',   r3.data?.productId === productId);
  assert('quantity updated to 5',   r3.data?.quantity === 5);
  info(`updated item → ${JSON.stringify(r3.data)}`);

  // ── DELETE /v1/cart/{userId}/items ────────────────────────────────────────
  endpoint('DELETE', `/v1/cart/${userId}/items`);
  info(`Path variable: userId = "${userId}"`);
  info('Request body: { productId: String, quantity: int }  (only productId is used for deletion)');
  info('Expected response: String (confirmation message)');

  const r4 = await req('DELETE', `/v1/cart/${userId}/items`, {
    token,
    body: { productId, quantity: 0 },
  });
  assert('HTTP 200',               r4.status === 200,            `got ${r4.status}  ${r4.ms}ms`);
  assert('response is a string',   typeof r4.data === 'string');
  info(`response → "${r4.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. ORDER SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testOrderService(token) {
  section('4. ORDER SERVICE  (/v1/orders)', 8500, 'Order Service');

  const userId = '1';
  let   orderId;

  // ── POST /v1/orders ───────────────────────────────────────────────────────
  endpoint('POST', '/v1/orders');
  info('Request body: { userId: String, orderItemList: Array<{ productId: String, quantity: int }> }');
  info('Expected response: { userId, orderId, orderItemList, orderStatus }');
  info('Initial orderStatus will be PAYMENT_PENDING');

  const r1 = await req('POST', '/v1/orders', {
    token,
    body: {
      userId,
      orderItemList: [
        { productId: `prod_${Date.now()}`,     quantity: 1 },
        { productId: `prod_${Date.now() + 1}`, quantity: 3 },
      ],
    },
  });
  assert('HTTP 200',                         r1.status === 200,                              `got ${r1.status}  ${r1.ms}ms`);
  assert('response.orderId exists',          r1.data?.orderId !== undefined && r1.data?.orderId !== null);
  assert('response.userId matches',          r1.data?.userId === userId);
  assert('response.orderItemList is array',  Array.isArray(r1.data?.orderItemList));
  assert('response.orderItemList has 2',     r1.data?.orderItemList?.length === 2);
  assert('response.orderStatus exists',      r1.data?.orderStatus !== undefined);
  orderId = r1.data?.orderId;
  info(`created orderId → ${orderId}  status → ${r1.data?.orderStatus}`);

  // ── GET /v1/orders/{userId} ───────────────────────────────────────────────
  endpoint('GET', `/v1/orders/${userId}`);
  info(`Path variable: userId = "${userId}"`);
  info('Request body: none');
  info('Expected response: Array<{ userId, orderId, orderItemList, orderStatus }>');

  const r2 = await req('GET', `/v1/orders/${userId}`, { token });
  assert('HTTP 200',                      r2.status === 200,                          `got ${r2.status}  ${r2.ms}ms`);
  assert('response is array',             Array.isArray(r2.data));
  assert('contains our created order',    Array.isArray(r2.data) && r2.data.some(o => o.orderId === orderId));
  info(`orders found for user → ${r2.data?.length}`);

  // ── PATCH /v1/orders/payment-status ───────────────────────────────────────
  endpoint('PATCH', '/v1/orders/payment-status');
  info('Request body: { orderId: String, orderStatus: OrderStatus }');
  info('OrderStatus enum values: PAYMENT_FAILURE | PAYMENT_PENDING | PAYMENT_SUCCESS |');
  info('                         DELIVERY_WAITING | SHIPPING_AWAITING | SHIPPED | DELIVERED | CANCELLED | SUCCESSFUL');
  info('Expected response: String (success/failure message)');

  const r3 = await req('PATCH', '/v1/orders/payment-status', {
    token,
    body: { orderId, orderStatus: 'PAYMENT_SUCCESS' },
  });
  assert('HTTP 200',               r3.status === 200,            `got ${r3.status}  ${r3.ms}ms`);
  assert('response is a string',   typeof r3.data === 'string');
  info(`response → "${r3.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. PAYMENT SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testPaymentService(token) {
  section('5. PAYMENT SERVICE  (/v1/payments)', 8600, 'Payment Service');

  // ── POST /v1/payments ─────────────────────────────────────────────────────
  endpoint('POST', '/v1/payments');
  info('Request body: { orderId: String, amount: Long, phonNumber: String, email: String }');
  info('Note: "phonNumber" is a typo in the source — use exactly as shown (missing "e")');
  info('Internally routes to Stripe or Razorpay based on service config');
  info('Expected response: String (payment link URL)');
  info('NOTE: Needs live payment gateway credentials. Asserting endpoint reachability only.');

  const r1 = await req('POST', '/v1/payments', {
    token,
    body: {
      orderId   : `order_test_${Date.now()}`,
      amount    : 100,
      phonNumber: '9999999999',
      email     : 'test@test.com',
    },
  });
  assert('endpoint reachable (not 404/405)',  r1.status !== 404 && r1.status !== 405, `got ${r1.status}  ${r1.ms}ms`);
  const preview = typeof r1.data === 'string' ? `"${r1.data.slice(0, 120)}"` : JSON.stringify(r1.data);
  info(`status → ${r1.status}  response → ${preview}`);

  // ── POST /v1/payments/webhooks ────────────────────────────────────────────
  endpoint('POST', '/v1/payments/webhooks');
  info('Required header: Stripe-Signature: <stripe_signature_value>');
  info('Request body: raw Stripe webhook JSON payload (String, not JSON-encoded)');
  info('Internally verifies Stripe signature, then updates order status via Order Service');
  info('Expected response: 200 OK (empty) on success, 400 with error message on bad signature');
  info('NOTE: Sending invalid signature — expecting 400 (signature rejection = endpoint working correctly)');

  const r2 = await fetch(`${HOST}/v1/payments/webhooks`, {
    method : 'POST',
    headers: {
      'Authorization'   : `Bearer ${token}`,
      'Content-Type'    : 'text/plain',
      'Stripe-Signature': 't=invalid,v1=invalidsig',
    },
    body: '{"type":"test"}',
  });
  const r2ms   = Date.now();
  const r2body = await r2.text();
  assert('endpoint reachable (not 404/405)',     r2.status !== 404 && r2.status !== 405,  `got ${r2.status}`);
  assert('rejects invalid sig with 400',         r2.status === 400);
  info(`status → ${r2.status}  (400 = Stripe signature correctly rejected)`);
  info(`response → "${r2body.slice(0, 120)}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. NOTIFICATION SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function testNotificationService(token) {
  section('6. NOTIFICATION SERVICE  (/v1/notifications)', 8700, 'Notification Service');

  // ── POST /v1/notifications/send-message ──────────────────────────────────
  endpoint('POST', '/v1/notifications/send-message');
  info('Request body: { userId: String, phoneNumber: String, message: String }');
  info('Internally publishes to Kafka topic "my-topic-3" — does NOT send SMS/email directly');
  info('Expected response: String → "Message has been send"');

  const r1 = await req('POST', '/v1/notifications/send-message', {
    token,
    body: {
      userId     : `testuser_${Date.now()}`,
      phoneNumber: '9999999999',
      message    : 'Hello from the API test suite!',
    },
  });
  assert('HTTP 200',               r1.status === 200,            `got ${r1.status}  ${r1.ms}ms`);
  assert('response is a string',   typeof r1.data === 'string');
  assert('response confirms send', typeof r1.data === 'string' && r1.data.toLowerCase().includes('message'));
  info(`response → "${r1.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// status_api.md — append run report
// ══════════════════════════════════════════════════════════════════════════════

async function appendStatusReport() {
  const now      = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const filePath = 'status_api.md';

  let md = `\n## Run: ${now}  |  Gateway: ${HOST}  |  Auth: ${AUTH_HOST}\n\n`;

  // ── Service-level summary table ──────────────────────────────────────────
  md += `| Service | Working Endpoints | Total Endpoints | Status |\n`;
  md += `|---|:---:|:---:|---|\n`;

  for (const svc of serviceResults) {
    const total   = svc.endpoints.length;
    const working = svc.endpoints.filter(e => e.assertFailed === 0 && e.assertPassed > 0).length;
    let   status;
    if (working === total && total > 0) status = '✅ ALL PASS';
    else if (working === 0)             status = '❌ ALL FAIL';
    else                                status = `⚠️ PARTIAL`;
    md += `| ${svc.name} | ${working} | ${total} | ${status} |\n`;
  }

  // ── Per-endpoint detail ──────────────────────────────────────────────────
  md += `\n### Endpoint Detail\n\n`;

  for (const svc of serviceResults) {
    md += `**${svc.name}**\n`;
    if (svc.endpoints.length === 0) {
      md += `- _(no endpoints recorded — service may have crashed before any endpoint ran)_\n`;
    }
    for (const ep of svc.endpoints) {
      const ok  = ep.assertFailed === 0 && ep.assertPassed > 0;
      const icon = ok ? '✅' : '❌';
      md += `- ${icon} \`${ep.method} ${ep.path}\``;
      if (!ok) md += `  _(${ep.assertPassed} passed, ${ep.assertFailed} failed)_`;
      md += `\n`;
    }
    md += `\n`;
  }

  // ── Overall totals ───────────────────────────────────────────────────────
  const totalEndpoints   = serviceResults.reduce((s, svc) => s + svc.endpoints.length, 0);
  const workingEndpoints = serviceResults.reduce((s, svc) =>
    s + svc.endpoints.filter(e => e.assertFailed === 0 && e.assertPassed > 0).length, 0);

  md += `**Overall: ${workingEndpoints}/${totalEndpoints} endpoints working**\n`;
  md += `\n---\n`;

  await fs.appendFile(filePath, md, 'utf8');
  console.log(dim(`\n   Status report appended → ${filePath}`));
}

// ══════════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(bold(cyan('\n⚡  E-Commerce Microservices — API Endpoint Test Suite')));
  console.log(dim(`   Gateway  : ${HOST}  (all API calls)`));
  console.log(dim(`   Auth     : ${AUTH_HOST}  (OAuth2 token)`));
  console.log(dim(`   Client   : ${CLIENT_ID}`));
  console.log(dim(`   User ID : ${TEST_USER_ID}  (for /v1/users/{id} tests)`));
  console.log('');

  // ── Get OAuth token ───────────────────────────────────────────────────────
  console.log(bold('── OAuth2 Token (client_credentials) ──'));
  let token;
  try {
    token = await getToken();
  } catch (e) {
    console.log(red(`✗  Could not get token: ${e.message}`));
    console.log(dim('   Check: is User Service running? Are CLIENT_ID / CLIENT_SECRET correct?'));
    process.exit(1);
  }

  // ── Run each service ──────────────────────────────────────────────────────
  const suites = [
    ['User Service',         () => testUserService(token)],
    ['Product Service',      () => testProductService(token)],
    ['Cart Service',         () => testCartService(token)],
    ['Order Service',        () => testOrderService(token)],
    ['Payment Service',      () => testPaymentService(token)],
    ['Notification Service', () => testNotificationService(token)],
  ];

  for (const [name, fn] of suites) {
    try {
      await fn();
    } catch (e) {
      failed++;
      console.log(red(`\n  FATAL in ${name}: ${e.message}`));
      console.log(dim(`  ${e.stack?.split('\n').slice(1, 3).join('\n  ')}`));
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${bold(cyan('━━━ RESULTS ━━━'))}`);
  console.log(`  Total   : ${total}`);
  console.log(`  Passed  : ${green(String(passed))}`);
  console.log(`  Failed  : ${failed > 0 ? red(String(failed)) : String(failed)}`);
  console.log(`  Score   : ${failed === 0 ? green('ALL PASS ✓') : yellow(`${passed} / ${total}`)}`);
  console.log('');

  await appendStatusReport();

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(red('\n❌ Fatal: ' + e.message));
  process.exit(1);
});
