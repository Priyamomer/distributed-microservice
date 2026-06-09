// all-api-endpoint-testing.js
// Each endpoint runs in complete isolation: fresh token, own prerequisites, own try/catch.
//
// Usage:
//   node all-api-endpoint-testing.js
//   HOST=http://localhost:8000 TEST_USER_ID=1 node all-api-endpoint-testing.js

const fs = require('fs').promises;

const HOST          = process.env.HOST          || 'http://62.238.15.118:30000';
const AUTH_HOST     = process.env.AUTH_HOST     || 'http://62.238.15.118:30200';
const CLIENT_ID     = process.env.CLIENT_ID     || 'productService';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'productServiceSecret';
const TEST_USER_ID  = parseInt(process.env.TEST_USER_ID || '1');

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const R      = '\x1b[0m';
const green  = s => `\x1b[32m${s}${R}`;
const red    = s => `\x1b[31m${s}${R}`;
const yellow = s => `\x1b[33m${s}${R}`;
const cyan   = s => `\x1b[36m${s}${R}`;
const bold   = s => `\x1b[1m${s}${R}`;
const dim    = s => `\x1b[2m${s}${R}`;

let passed = 0, failed = 0;

// ── Per-run tracking (for status_api.md) ──────────────────────────────────────
const serviceResults = [];
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
  if (rawBody !== undefined) opts.body = rawBody;
  else if (body !== undefined) opts.body = JSON.stringify(body);
  const t0  = Date.now();
  const res = await fetch(url, opts);
  const ms  = Date.now() - t0;
  const ct  = res.headers.get('content-type') || '';
  let data;
  try { data = ct.includes('application/json') ? await res.json() : await res.text(); }
  catch { data = null; }
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

// Only prints the section header the first time a service is encountered.
function section(title, port, name) {
  const svcName = name || title;
  if (!currentService || currentService.name !== svcName) {
    currentService = { name: svcName, endpoints: [] };
    serviceResults.push(currentService);
    console.log(`\n${bold(cyan('━━━ ' + title + ' ━━━'))}  ${dim('port ' + port)}`);
  }
}

function endpoint(method, path) {
  currentEndpoint = { method, path, assertPassed: 0, assertFailed: 0 };
  if (currentService) currentService.endpoints.push(currentEndpoint);
  const colors = { GET: cyan, POST: green, PATCH: yellow, DELETE: red };
  const col    = colors[method] || (s => s);
  console.log(`\n  ${bold(col(method.padEnd(7)))} ${path}`);
}

// ── OAuth2 token — called fresh per endpoint ──────────────────────────────────

async function getToken() {
  const res = await fetch(`${AUTH_HOST}/oauth2/token`, {
    method : 'POST',
    headers: {
      Authorization  : 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type' : 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=openid',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  return data.access_token;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. USER SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function ep_POST_auth_signup() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('POST', '/v1/auth/signup');
  info('Request body: { email: String, password: String }');
  info('Expected response: { email: String, roles: Array }');
  const token = await getToken();
  const email = randomEmail();
  const r     = await req('POST', '/v1/auth/signup', { token, body: { email, password: 'Test@1234' } });
  assert('HTTP 200',                r.status === 200,              `got ${r.status}  ${r.ms}ms`);
  assert('response.email matches',  r.data?.email === email);
  assert('response.roles is array', Array.isArray(r.data?.roles));
  info(`response → ${JSON.stringify(r.data)}`);
}

async function ep_POST_auth_password() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('POST', '/v1/auth/password');
  info('Prerequisite: signs up a fresh user, then changes that user\'s password');
  info('Request body: { email: String, oldPassword: String, newPassword: String }');
  info('Expected response: String (success/failure message)');
  const token = await getToken();
  const email = randomEmail();
  await req('POST', '/v1/auth/signup', { token, body: { email, password: 'Test@1234' } });
  const r = await req('POST', '/v1/auth/password', {
    token,
    body: { email, oldPassword: 'Test@1234', newPassword: 'NewTest@5678' },
  });
  assert('HTTP 200',              r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response is a string',  typeof r.data === 'string');
  info(`response → "${r.data}"`);
}

async function ep_POST_roles() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('POST', '/v1/roles');
  info('Request body: { name: String }');
  info('Expected response: { id: Long, role: String }');
  const token    = await getToken();
  const roleName = `ROLE_TEST_${Date.now()}`;
  const r        = await req('POST', '/v1/roles', { token, body: { name: roleName } });
  assert('HTTP 200',                   r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response.id exists',         r.data?.id !== undefined);
  assert('response.role matches name', r.data?.role === roleName);
  info(`created role → ${JSON.stringify(r.data)}`);
}

async function ep_GET_roles() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('GET', '/v1/roles');
  info('Prerequisite: creates a role so the list is guaranteed non-empty');
  info('Request body: none');
  info('Expected response: Array<{ id: Long, role: String }>');
  const token    = await getToken();
  const roleName = `ROLE_TEST_${Date.now()}`;
  const created  = await req('POST', '/v1/roles', { token, body: { name: roleName } });
  const roleId   = created.data?.id;
  const r        = await req('GET', '/v1/roles', { token });
  assert('HTTP 200',                    r.status === 200,                           `got ${r.status}  ${r.ms}ms`);
  assert('response is array',           Array.isArray(r.data));
  assert('created role is in the list', Array.isArray(r.data) && r.data.some(x => x.id === roleId));
  info(`total roles returned → ${r.data?.length}`);
}

async function ep_GET_users_by_id() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('GET', `/v1/users/${TEST_USER_ID}`);
  info(`Path variable: id = ${TEST_USER_ID}  (set TEST_USER_ID env to change)`);
  info('Request body: none');
  info('Expected response: { email: String, roles: Array<Role> }');
  const token = await getToken();
  const r     = await req('GET', `/v1/users/${TEST_USER_ID}`, { token });
  assert('HTTP 200',                  r.status === 200,                `got ${r.status}  ${r.ms}ms`);
  assert('response.email is string',  typeof r.data?.email === 'string');
  assert('response.roles is array',   Array.isArray(r.data?.roles));
  info(`response → ${JSON.stringify(r.data)}`);
}

async function ep_POST_users_roles() {
  section('1. USER SERVICE  (/v1/auth  |  /v1/users  |  /v1/roles)', 8200, 'User Service');
  endpoint('POST', `/v1/users/${TEST_USER_ID}/roles`);
  info(`Path variable: id = ${TEST_USER_ID}`);
  info('Prerequisite: creates a role, then assigns it to the user');
  info('Request body: { roleIds: Array<Long> }');
  info('Expected response: { email: String, roles: Array<Role> }');
  const token    = await getToken();
  const roleName = `ROLE_TEST_${Date.now()}`;
  const created  = await req('POST', '/v1/roles', { token, body: { name: roleName } });
  const roleId   = created.data?.id;
  const r        = await req('POST', `/v1/users/${TEST_USER_ID}/roles`, { token, body: { roleIds: [roleId] } });
  assert('HTTP 200',                  r.status === 200,                `got ${r.status}  ${r.ms}ms`);
  assert('response.email is string',  typeof r.data?.email === 'string');
  assert('response.roles is array',   Array.isArray(r.data?.roles));
  info(`response → ${JSON.stringify(r.data)}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PRODUCT SERVICE
// ══════════════════════════════════════════════════════════════════════════════

function makeProduct() {
  return {
    title      : `Test Product ${Date.now()}`,
    price      : 999,
    category   : 'Electronics',
    description: 'API test suite product',
    image      : 'https://test.com/image.png',
    currency   : 'USD',
  };
}

async function ep_POST_products() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  endpoint('POST', '/v1/products');
  info('Request body: { title, price: int, category, description, image, currency }');
  info('Expected response: { id, title, price, category, description, image, currency }');
  const token = await getToken();
  const p     = makeProduct();
  const r     = await req('POST', '/v1/products', { token, body: p });
  assert('HTTP 200',           r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response.id exists', r.data?.id !== undefined);
  assert('title matches',      r.data?.title === p.title);
  assert('price matches',      r.data?.price === p.price);
  assert('currency matches',   r.data?.currency === p.currency);
  info(`created productId → ${r.data?.id}`);
}

async function ep_GET_products() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  endpoint('GET', '/v1/products');
  info('Request body: none');
  info('Expected response: Array<{ id, title, price, category, description, image, currency }>');
  const token = await getToken();
  const r     = await req('GET', '/v1/products', { token });
  assert('HTTP 200',           r.status === 200,              `got ${r.status}  ${r.ms}ms`);
  assert('response is array',  Array.isArray(r.data));
  assert('array is non-empty', (r.data?.length ?? 0) > 0);
  info(`total products returned → ${r.data?.length}`);
}

async function ep_GET_products_by_id() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  const token   = await getToken();
  const p       = makeProduct();
  const created = await req('POST', '/v1/products', { token, body: p });
  const id      = created.data?.id;
  endpoint('GET', `/v1/products/${id}`);
  info(`Path variable: id = "${id}"  (created as prerequisite)`);
  info('Request body: none');
  info('Expected response: { id, title, price, category, description, image, currency }');
  const r = await req('GET', `/v1/products/${id}`, { token });
  assert('HTTP 200',      r.status === 200,          `got ${r.status}  ${r.ms}ms`);
  assert('id matches',    r.data?.id === id);
  assert('title matches', r.data?.title === p.title);
  assert('price matches', r.data?.price === p.price);
  info(`response → ${JSON.stringify(r.data)}`);
}

async function ep_PATCH_products() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  const token   = await getToken();
  const p       = makeProduct();
  const created = await req('POST', '/v1/products', { token, body: p });
  const id      = created.data?.id;
  endpoint('PATCH', '/v1/products');
  info('Request body: { id (required — identifies product), title, price, category, description, image, currency }');
  info('Note: id goes in the body, NOT in the URL path');
  info('Expected response: { id, title, price, category, description, image, currency }  (updated)');
  const updatedTitle = `Updated Product ${Date.now()}`;
  const r = await req('PATCH', '/v1/products', {
    token,
    body: { ...p, id, title: updatedTitle, price: 1499 },
  });
  assert('HTTP 200',          r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('title is updated',  r.data?.title === updatedTitle);
  assert('price is updated',  r.data?.price === 1499);
  info(`updated title → "${r.data?.title}"  price → ${r.data?.price}`);
}

async function ep_POST_products_search() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  endpoint('POST', '/v1/products/search');
  info('Request body: { query: String, pageNumber: int, itemsPerPage: int, sortParams: [{ sortParamName, sortType }] }');
  info('sortType values: "ASC" | "DESC"');
  info('Expected response: Page<Product> → { content: Array, totalElements, totalPages, size, number }');
  const token = await getToken();
  const r     = await req('POST', '/v1/products/search', {
    token,
    body: {
      query       : 'test',
      pageNumber  : 0,
      itemsPerPage: 5,
      sortParams  : [{ sortParamName: 'amount', sortType: 'ASC' }],
    },
  });
  assert('HTTP 200',                      r.status === 200,                         `got ${r.status}  ${r.ms}ms`);
  assert('response.content is array',     Array.isArray(r.data?.content));
  assert('response.totalElements exists', typeof r.data?.totalElements === 'number');
  assert('response.totalPages exists',    typeof r.data?.totalPages === 'number');
  info(`hits → ${r.data?.totalElements}  page ${(r.data?.number ?? 0) + 1}/${r.data?.totalPages}`);
}

async function ep_DELETE_products_by_id() {
  section('2. PRODUCT SERVICE  (/v1/products)', 8300, 'Product Service');
  const token   = await getToken();
  const p       = makeProduct();
  const created = await req('POST', '/v1/products', { token, body: p });
  const id      = created.data?.id;
  endpoint('DELETE', `/v1/products/${id}`);
  info(`Path variable: id = "${id}"  (created as prerequisite)`);
  info('Request body: none');
  info('Expected response: { id, title, price, ... }  (the deleted product object)');
  const r = await req('DELETE', `/v1/products/${id}`, { token });
  assert('HTTP 200',                    r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('returned deleted product id', r.data?.id === id);
  info(`deleted product → ${JSON.stringify(r.data)}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. CART SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function ep_GET_cart() {
  section('3. CART SERVICE  (/v1/cart)  — backed by Redis', 8400, 'Cart Service');
  endpoint('GET', '/v1/cart/1');
  info('Path variable: userId = "1"');
  info('Request body: none');
  info('Expected response: { userId: String, itemDtoList: Array<{ productId, quantity }> }');
  const token = await getToken();
  const r     = await req('GET', '/v1/cart/1', { token });
  assert('HTTP 200',                      r.status === 200,                    `got ${r.status}  ${r.ms}ms`);
  assert('response.userId matches',       r.data?.userId === '1');
  assert('response.itemDtoList is array', Array.isArray(r.data?.itemDtoList));
  info(`cart → ${JSON.stringify(r.data)}`);
}

async function ep_POST_cart_items() {
  section('3. CART SERVICE  (/v1/cart)  — backed by Redis', 8400, 'Cart Service');
  endpoint('POST', '/v1/cart/1/items');
  info('Path variable: userId = "1"');
  info('Request body: { productId: String, quantity: int }');
  info('Expected response: CartItem { id, productId, quantity }');
  const token     = await getToken();
  const productId = `prod_${Date.now()}`;
  const r         = await req('POST', '/v1/cart/1/items', { token, body: { productId, quantity: 2 } });
  assert('HTTP 200',               r.status === 200,              `got ${r.status}  ${r.ms}ms`);
  assert('response.productId ok',  r.data?.productId === productId);
  assert('response.quantity = 2',  r.data?.quantity === 2);
  info(`added item → ${JSON.stringify(r.data)}`);
}

async function ep_PATCH_cart_items() {
  section('3. CART SERVICE  (/v1/cart)  — backed by Redis', 8400, 'Cart Service');
  const token     = await getToken();
  const productId = `prod_${Date.now()}`;
  await req('POST', '/v1/cart/1/items', { token, body: { productId, quantity: 2 } });
  endpoint('PATCH', '/v1/cart/1/items');
  info('Path variable: userId = "1"');
  info('Prerequisite: adds the item to cart first, then updates quantity');
  info('Request body: { productId: String, quantity: int }  (new quantity replaces old)');
  info('Expected response: CartItem { id, productId, quantity }');
  const r = await req('PATCH', '/v1/cart/1/items', { token, body: { productId, quantity: 5 } });
  assert('HTTP 200',              r.status === 200,              `got ${r.status}  ${r.ms}ms`);
  assert('response.productId ok', r.data?.productId === productId);
  assert('quantity updated to 5', r.data?.quantity === 5);
  info(`updated item → ${JSON.stringify(r.data)}`);
}

async function ep_DELETE_cart_items() {
  section('3. CART SERVICE  (/v1/cart)  — backed by Redis', 8400, 'Cart Service');
  const token     = await getToken();
  const productId = `prod_${Date.now()}`;
  await req('POST', '/v1/cart/1/items', { token, body: { productId, quantity: 2 } });
  endpoint('DELETE', '/v1/cart/1/items');
  info('Path variable: userId = "1"');
  info('Prerequisite: adds the item to cart first, then deletes it');
  info('Request body: { productId: String, quantity: int }  (only productId is used for deletion)');
  info('Expected response: String (confirmation message)');
  const r = await req('DELETE', '/v1/cart/1/items', { token, body: { productId, quantity: 0 } });
  assert('HTTP 200',             r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response is a string', typeof r.data === 'string');
  info(`response → "${r.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. ORDER SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function ep_POST_orders() {
  section('4. ORDER SERVICE  (/v1/orders)', 8500, 'Order Service');
  endpoint('POST', '/v1/orders');
  info('Request body: { userId: String, orderItemList: Array<{ productId: String, quantity: int }> }');
  info('Expected response: { userId, orderId, orderItemList, orderStatus }');
  info('Initial orderStatus will be PAYMENT_PENDING');
  const token = await getToken();
  const r     = await req('POST', '/v1/orders', {
    token,
    body: {
      userId       : '1',
      orderItemList: [
        { productId: `prod_${Date.now()}`,     quantity: 1 },
        { productId: `prod_${Date.now() + 1}`, quantity: 3 },
      ],
    },
  });
  assert('HTTP 200',                        r.status === 200,                            `got ${r.status}  ${r.ms}ms`);
  assert('response.orderId exists',         r.data?.orderId !== undefined && r.data?.orderId !== null);
  assert('response.userId matches',         r.data?.userId === '1');
  assert('response.orderItemList is array', Array.isArray(r.data?.orderItemList));
  assert('response.orderItemList has 2',    r.data?.orderItemList?.length === 2);
  assert('response.orderStatus exists',     r.data?.orderStatus !== undefined);
  info(`created orderId → ${r.data?.orderId}  status → ${r.data?.orderStatus}`);
}

async function ep_GET_orders() {
  section('4. ORDER SERVICE  (/v1/orders)', 8500, 'Order Service');
  const token   = await getToken();
  const created = await req('POST', '/v1/orders', {
    token,
    body: {
      userId       : '1',
      orderItemList: [{ productId: `prod_${Date.now()}`, quantity: 1 }],
    },
  });
  const orderId = created.data?.orderId;
  endpoint('GET', '/v1/orders/1');
  info('Path variable: userId = "1"');
  info('Prerequisite: creates an order first to guarantee at least one result');
  info('Request body: none');
  info('Expected response: Array<{ userId, orderId, orderItemList, orderStatus }>');
  const r = await req('GET', '/v1/orders/1', { token });
  assert('HTTP 200',                   r.status === 200,                        `got ${r.status}  ${r.ms}ms`);
  assert('response is array',          Array.isArray(r.data));
  assert('contains our created order', Array.isArray(r.data) && r.data.some(o => o.orderId === orderId));
  info(`orders found for user → ${r.data?.length}`);
}

async function ep_PATCH_orders_payment_status() {
  section('4. ORDER SERVICE  (/v1/orders)', 8500, 'Order Service');
  const token   = await getToken();
  const created = await req('POST', '/v1/orders', {
    token,
    body: {
      userId       : '1',
      orderItemList: [{ productId: `prod_${Date.now()}`, quantity: 1 }],
    },
  });
  const orderId = created.data?.orderId;
  endpoint('PATCH', '/v1/orders/payment-status');
  info('Prerequisite: creates an order first, then updates its payment status');
  info('Request body: { orderId: String, orderStatus: OrderStatus }');
  info('OrderStatus enum values: PAYMENT_FAILURE | PAYMENT_PENDING | PAYMENT_SUCCESS |');
  info('                         DELIVERY_WAITING | SHIPPING_AWAITING | SHIPPED | DELIVERED | CANCELLED | SUCCESSFUL');
  info('Expected response: String (success/failure message)');
  const r = await req('PATCH', '/v1/orders/payment-status', {
    token,
    body: { orderId, orderStatus: 'PAYMENT_SUCCESS' },
  });
  assert('HTTP 200',             r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response is a string', typeof r.data === 'string');
  info(`response → "${r.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. PAYMENT SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function ep_POST_payments() {
  section('5. PAYMENT SERVICE  (/v1/payments)', 8600, 'Payment Service');
  endpoint('POST', '/v1/payments');
  info('Request body: { orderId: String, amount: Long, phonNumber: String, email: String }');
  info('Note: "phonNumber" is a typo in the source — use exactly as shown (missing "e")');
  info('Expected response: String (payment link URL)');
  info('NOTE: Needs live payment gateway credentials. Asserting endpoint reachability only.');
  const token = await getToken();
  const r     = await req('POST', '/v1/payments', {
    token,
    body: {
      orderId   : `order_test_${Date.now()}`,
      amount    : 100,
      phonNumber: '9999999999',
      email     : 'test@test.com',
    },
  });
  assert('endpoint reachable (not 404/405)', r.status !== 404 && r.status !== 405, `got ${r.status}  ${r.ms}ms`);
  const preview = typeof r.data === 'string' ? `"${r.data.slice(0, 120)}"` : JSON.stringify(r.data);
  info(`status → ${r.status}  response → ${preview}`);
}

async function ep_POST_payments_webhooks() {
  section('5. PAYMENT SERVICE  (/v1/payments)', 8600, 'Payment Service');
  endpoint('POST', '/v1/payments/webhooks');
  info('Required header: Stripe-Signature: <stripe_signature_value>');
  info('Request body: raw Stripe webhook JSON payload (String, not JSON-encoded)');
  info('Expected response: 400 on invalid Stripe signature (= endpoint is working correctly)');
  const token = await getToken();
  const res   = await fetch(`${HOST}/v1/payments/webhooks`, {
    method : 'POST',
    headers: {
      'Authorization'   : `Bearer ${token}`,
      'Content-Type'    : 'text/plain',
      'Stripe-Signature': 't=invalid,v1=invalidsig',
    },
    body: '{"type":"test"}',
  });
  const body = await res.text();
  assert('endpoint reachable (not 404/405)', res.status !== 404 && res.status !== 405, `got ${res.status}`);
  assert('rejects invalid sig with 400',     res.status === 400);
  info(`status → ${res.status}  (400 = Stripe signature correctly rejected)`);
  info(`response → "${body.slice(0, 120)}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. NOTIFICATION SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function ep_POST_notifications() {
  section('6. NOTIFICATION SERVICE  (/v1/notifications)', 8700, 'Notification Service');
  endpoint('POST', '/v1/notifications/send-message');
  info('Request body: { userId: String, phoneNumber: String, message: String }');
  info('Internally publishes to Kafka topic "my-topic-3" — does NOT send SMS/email directly');
  info('Expected response: String → "Message has been send"');
  const token = await getToken();
  const r     = await req('POST', '/v1/notifications/send-message', {
    token,
    body: {
      userId     : `testuser_${Date.now()}`,
      phoneNumber: '9999999999',
      message    : 'Hello from the API test suite!',
    },
  });
  assert('HTTP 200',               r.status === 200,            `got ${r.status}  ${r.ms}ms`);
  assert('response is a string',   typeof r.data === 'string');
  assert('response confirms send', typeof r.data === 'string' && r.data.toLowerCase().includes('message'));
  info(`response → "${r.data}"`);
}

// ══════════════════════════════════════════════════════════════════════════════
// status_api.md — append run report
// ══════════════════════════════════════════════════════════════════════════════

async function appendStatusReport() {
  const now      = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const filePath = 'status_api.md';

  let md = `\n## Run: ${now}  |  Gateway: ${HOST}  |  Auth: ${AUTH_HOST}\n\n`;

  md += `| Service | Working Endpoints | Total Endpoints | Status |\n`;
  md += `|---|:---:|:---:|---|\n`;

  for (const svc of serviceResults) {
    const total   = svc.endpoints.length;
    const working = svc.endpoints.filter(e => e.assertFailed === 0 && e.assertPassed > 0).length;
    let   status;
    if (working === total && total > 0) status = '✅ ALL PASS';
    else if (working === 0)             status = '❌ ALL FAIL';
    else                                status = '⚠️ PARTIAL';
    md += `| ${svc.name} | ${working} | ${total} | ${status} |\n`;
  }

  md += `\n### Endpoint Detail\n\n`;

  for (const svc of serviceResults) {
    md += `**${svc.name}**\n`;
    if (svc.endpoints.length === 0) {
      md += `- _(no endpoints recorded)_\n`;
    }
    for (const ep of svc.endpoints) {
      const ok   = ep.assertFailed === 0 && ep.assertPassed > 0;
      const icon = ok ? '✅' : '❌';
      md += `- ${icon} \`${ep.method} ${ep.path}\``;
      if (!ok) md += `  _(${ep.assertPassed} passed, ${ep.assertFailed} failed)_`;
      md += `\n`;
    }
    md += `\n`;
  }

  const totalEndpoints   = serviceResults.reduce((s, svc) => s + svc.endpoints.length, 0);
  const workingEndpoints = serviceResults.reduce((s, svc) =>
    s + svc.endpoints.filter(e => e.assertFailed === 0 && e.assertPassed > 0).length, 0);

  md += `**Overall: ${workingEndpoints}/${totalEndpoints} endpoints working**\n`;
  md += `\n---\n`;

  await fs.appendFile(filePath, md, 'utf8');
  console.log(dim(`\n   Status report appended → ${filePath}`));
}

// ══════════════════════════════════════════════════════════════════════════════
// Endpoint registry — order determines execution order
// ══════════════════════════════════════════════════════════════════════════════

const ENDPOINTS = [
  ep_POST_auth_signup,
  ep_POST_auth_password,
  ep_POST_roles,
  ep_GET_roles,
  ep_GET_users_by_id,
  ep_POST_users_roles,
  ep_POST_products,
  ep_GET_products,
  ep_GET_products_by_id,
  ep_PATCH_products,
  ep_POST_products_search,
  ep_DELETE_products_by_id,
  ep_GET_cart,
  ep_POST_cart_items,
  ep_PATCH_cart_items,
  ep_DELETE_cart_items,
  ep_POST_orders,
  ep_GET_orders,
  ep_PATCH_orders_payment_status,
  ep_POST_payments,
  ep_POST_payments_webhooks,
  ep_POST_notifications,
];

// ══════════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(bold(cyan('\n⚡  E-Commerce Microservices — API Endpoint Test Suite')));
  console.log(dim(`   Gateway  : ${HOST}  (all API calls)`));
  console.log(dim(`   Auth     : ${AUTH_HOST}  (OAuth2 token)`));
  console.log(dim(`   Client   : ${CLIENT_ID}`));
  console.log(dim(`   User ID  : ${TEST_USER_ID}  (for /v1/users/{id} tests)`));
  console.log(dim(`   Mode     : isolated — each endpoint gets its own token and setup`));
  console.log('');

  // Quick auth sanity check
  console.log(bold('── Auth sanity check ──'));
  try {
    await getToken();
    console.log(`  ${green('✓')} OAuth2 token reachable  ${dim('(client_credentials / openid)')}`);
  } catch (e) {
    console.log(red(`  ✗ Auth server unreachable: ${e.message}`));
    console.log(dim('    All endpoint tests will fail independently below.'));
  }

  // Run each endpoint in isolation
  for (const ep of ENDPOINTS) {
    try {
      await ep();
    } catch (e) {
      failed++;
      if (currentEndpoint) currentEndpoint.assertFailed++;
      console.log(red(`\n  FATAL: ${e.message}`));
      console.log(dim(`  ${e.stack?.split('\n').slice(1, 3).join('\n  ')}`));
    }
  }

  // Summary
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
