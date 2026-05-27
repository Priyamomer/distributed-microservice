// test-cart-get.js — isolated cart GET test
// Usage: node test-cart-get.js

const AUTH_HOST     = 'http://62.238.15.118:30200';
const GATEWAY_HOST  = 'http://62.238.15.118:30000';
const CLIENT_ID     = 'productService';
const CLIENT_SECRET = 'productServiceSecret';
const USER_ID       = '1';

async function main() {
  // Step 1 — get token
  console.log('── Step 1: Fetching token from', AUTH_HOST);
  const tokenRes = await fetch(`${AUTH_HOST}/oauth2/token`, {
    method : 'POST',
    headers: {
      'Authorization' : 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type'  : 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=openid',
  });
  const tokenData = await tokenRes.json();
  const token     = tokenData.access_token;
  console.log('   Token status :', tokenRes.status);
  console.log('   Token         :', token ? token.slice(0, 40) + '...' : 'FAILED');
  if (!token) { console.error('Could not get token'); process.exit(1); }

  // Step 2 — GET /v1/cart/1 with ONLY Authorization + Content-Type
  const url = `${GATEWAY_HOST}/v1/cart/${USER_ID}`;
  console.log('\n── Step 2: GET', url);
  console.log('   Headers sent:');
  console.log('     Authorization: Bearer', token.slice(0, 40) + '...');
  console.log('     Content-Type : application/json');

  const cartRes  = await fetch(url, {
    method : 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type' : 'application/json',
    },
  });

  console.log('\n── Response:');
  console.log('   Status :', cartRes.status, cartRes.statusText);
  console.log('   Headers:');
  cartRes.headers.forEach((v, k) => console.log(`     ${k}: ${v}`));

  const body = await cartRes.text();
  console.log('\n   Body   :', body);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
