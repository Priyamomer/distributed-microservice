// loadtest.js -- Hammer userservice with signup requests to trigger autoscaling
//
// Usage:
//   node loadtest.js
//   node loadtest.js --host http://62.238.15.118:30200 --concurrency 50 --requests 500

const args = Object.fromEntries(
  process.argv.slice(2)
    .reduce((acc, v, i, a) => { if (v.startsWith('--')) acc.push([v.slice(2), a[i+1]]); return acc; }, [])
);

const HOST       = args.host        || 'http://62.238.15.118:30200';
const AUTH_BASE  = args.auth        || HOST;
const CLIENT_ID  = args.clientId    || 'productService';
const CLIENT_SECRET = args.clientSecret || 'productServiceSecret';
const CONCURRENCY   = parseInt(args.concurrency || '200');
const TOTAL_REQS    = parseInt(args.requests    || '10000');

const green  = s => `\x1b[32m${s}\x1b[0m`;
const red    = s => `\x1b[31m${s}\x1b[0m`;
const yellow = s => `\x1b[33m${s}\x1b[0m`;
const cyan   = s => `\x1b[36m${s}\x1b[0m`;
const bold   = s => `\x1b[1m${s}\x1b[0m`;

async function getToken() {
  const res = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=openid',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token fetch failed: ' + JSON.stringify(data));
  return data.access_token;
}

async function signup(token, i) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${HOST}/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: `loadtest_${Date.now()}_${i}@test.com`,
        password: 'Test@1234',
      }),
    });
    return { ok: res.status < 500, status: res.status, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, err: e.message };
  }
}

async function main() {
  console.log(bold(cyan('\n⚡ UserService Load Test')));
  console.log(`   Target      : ${HOST}`);
  console.log(`   Concurrency : ${CONCURRENCY}`);
  console.log(`   Total reqs  : ${TOTAL_REQS}\n`);

  process.stdout.write('   Fetching token... ');
  const token = await getToken();
  console.log(green('✅ OK\n'));

  let completed = 0, passed = 0, failed = 0;
  const latencies = [];
  const startAll = Date.now();

  // Run in batches of CONCURRENCY
  for (let i = 0; i < TOTAL_REQS; i += CONCURRENCY) {
    const batch = Math.min(CONCURRENCY, TOTAL_REQS - i);
    const promises = Array.from({ length: batch }, (_, j) => signup(token, i + j));
    const results = await Promise.all(promises);

    for (const r of results) {
      completed++;
      latencies.push(r.ms);
      if (r.ok) passed++; else failed++;
    }

    const elapsed = ((Date.now() - startAll) / 1000).toFixed(1);
    const rps = (completed / elapsed).toFixed(0);
    process.stdout.write(`\r   Progress: ${completed}/${TOTAL_REQS}  ✓ ${green(passed)}  ✗ ${red(failed)}  ${rps} req/s   `);
  }

  const totalMs = Date.now() - startAll;
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  console.log('\n\n' + bold('   Results:'));
  console.log(`   Total time  : ${(totalMs / 1000).toFixed(2)}s`);
  console.log(`   Throughput  : ${Math.round(TOTAL_REQS / (totalMs / 1000))} req/s`);
  console.log(`   Passed      : ${green(passed)}`);
  console.log(`   Failed      : ${failed > 0 ? red(failed) : failed}`);
  console.log(`   Latency avg : ${avg}ms`);
  console.log(`   p50         : ${p50}ms`);
  console.log(`   p95         : ${yellow(p95 + 'ms')}`);
  console.log(`   p99         : ${p99 > 2000 ? red(p99 + 'ms') : yellow(p99 + 'ms')}`);
  console.log();
}

main().catch(e => {
  console.error(red('\n❌ Fatal: ' + e.message));
  process.exit(1);
});