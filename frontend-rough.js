// loadtest.js -- Hammer userservice with signup requests to trigger autoscaling
//
// Usage:
//   node loadtest.js
//   node loadtest.js --host http://62.238.15.118:30200 --concurrency 50 --requests 500

const args = Object.fromEntries(
  process.argv.slice(2)
    .reduce((acc, v, i, a) => { if (v.startsWith('--')) acc.push([v.slice(2), a[i+1]]); return acc; }, [])
);

const HOST          = args.host          || 'http://62.238.15.118:30200';
const AUTH_BASE     = args.auth          || HOST;
const CLIENT_ID     = args.clientId      || 'productService';
const CLIENT_SECRET = args.clientSecret  || 'productServiceSecret';
const CONCURRENCY   = parseInt(args.concurrency || '50');
const TOTAL_REQS    = parseInt(args.requests    || '10000');

// ── Chart config ──────────────────────────────────────────────────────────────
const CHART_W   = 80;    // braille columns (= 160 sub-columns of data)
const CHART_H   = 8;     // braille rows    (= 32 sub-rows of resolution)
const BUCKET_MS = 500;   // one data point every 500ms
const ROLLING_N = 100;   // rolling average window (requests)

// ── ANSI ──────────────────────────────────────────────────────────────────────
const R       = '\x1b[0m';
const green   = s => `\x1b[32m${s}${R}`;
const red     = s => `\x1b[31m${s}${R}`;
const yellow  = s => `\x1b[33m${s}${R}`;
const cyan    = s => `\x1b[36m${s}${R}`;
const magenta = s => `\x1b[35m${s}${R}`;
const bold    = s => `\x1b[1m${s}${R}`;
const dim     = s => `\x1b[2m${s}${R}`;
const goto    = (r, c) => `\x1b[${r};${c}H`;
const clrLine = () => '\x1b[2K';

// ── Braille line-chart engine ─────────────────────────────────────────────────
const BRAILLE_BASE = 0x2800;
const BRAILLE_BIT  = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

function brailleChart(seriesA, seriesB, maxVal, colorA, colorB) {
  const subCols = CHART_W * 2;
  const subRows = CHART_H * 4;

  const toRow = v => {
    if (v === null || v === undefined) return null;
    return Math.round(Math.max(0, Math.min(subRows - 1, (v / maxVal) * (subRows - 1))));
  };

  const rowsA = seriesA.map(toRow);
  const rowsB = seriesB.map(toRow);

  const gridA = Array.from({ length: CHART_H }, () => new Uint8Array(CHART_W));
  const gridB = Array.from({ length: CHART_H }, () => new Uint8Array(CHART_W));

  const paintDot = (grid, subCol, subRow) => {
    if (subRow === null) return;
    const bCol   = Math.floor(subCol / 2);
    const dotCol = subCol % 2;
    const bRow   = Math.floor((subRows - 1 - subRow) / 4);
    const dotRow = (subRows - 1 - subRow) % 4;
    if (bRow < 0 || bRow >= CHART_H) return;
    grid[bRow][bCol] |= BRAILLE_BIT[dotRow][dotCol];
  };

  const drawLine = (rows, grid) => {
    for (let col = 0; col < subCols; col++) {
      const r = rows[col];
      if (r === null) continue;
      paintDot(grid, col, r);
      if (col > 0 && rows[col - 1] !== null) {
        const r0 = rows[col - 1], r1 = r;
        const steps = Math.abs(r1 - r0);
        for (let s = 1; s < steps; s++) {
          const mid = Math.round(r0 + (r1 - r0) * (s / steps));
          paintDot(grid, col - 1 + (s / steps < 0.5 ? 0 : 1), mid);
        }
      }
    }
  };

  drawLine(rowsA, gridA);
  drawLine(rowsB, gridB);

  const lines = [];
  for (let bRow = 0; bRow < CHART_H; bRow++) {
    let line = '';
    for (let bCol = 0; bCol < CHART_W; bCol++) {
      const a = gridA[bRow][bCol];
      const b = gridB[bRow][bCol];
      if (a === 0 && b === 0) {
        line += ' ';
      } else if (a !== 0 && b !== 0) {
        line += colorB(String.fromCodePoint(BRAILLE_BASE | a | b));
      } else if (b !== 0) {
        line += colorB(String.fromCodePoint(BRAILLE_BASE | b));
      } else {
        line += colorA(String.fromCodePoint(BRAILLE_BASE | a));
      }
    }
    lines.push(line);
  }
  return lines;
}

// ── State ─────────────────────────────────────────────────────────────────────
let completed = 0, passed = 0, failed = 0, inFlight = 0;
let startAll, lastBucketTs, lastBucketCompleted = 0;
const ring    = [];    // { ts, ms, ok }
const buckets = [];    // { instantRps, avgRps, instantLat, avgLat }

// ── Stats ─────────────────────────────────────────────────────────────────────
function rollingAvg() {
  const win = ring.slice(-ROLLING_N);
  if (win.length < 2) return { rps: 0, lat: 0 };
  const span = win[win.length - 1].ts - win[0].ts;
  return {
    rps: span > 0 ? Math.round((win.length / span) * 1000) : 0,
    lat: Math.round(win.reduce((a, r) => a + r.ms, 0) / win.length),
  };
}

function maybePushBucket() {
  const now     = Date.now();
  const elapsed = now - lastBucketTs;
  if (elapsed < BUCKET_MS) return;

  const reqsIn     = completed - lastBucketCompleted;
  const instantRps = Math.round((reqsIn / elapsed) * 1000);
  const { rps: avgRps, lat: avgLat } = rollingAvg();
  const slice      = ring.slice(-Math.max(reqsIn, 1));
  const instantLat = slice.length
    ? Math.round(slice.reduce((a, r) => a + r.ms, 0) / slice.length)
    : 0;

  buckets.push({ instantRps, avgRps, instantLat, avgLat });
  if (buckets.length > CHART_W * 2) buckets.shift();

  lastBucketTs        = now;
  lastBucketCompleted = completed;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const { rps: avgRps, lat: avgLat } = rollingAvg();
  const last    = buckets[buckets.length - 1];
  const instRps = last?.instantRps ?? 0;
  const instLat = last?.instantLat ?? 0;

  const elapsedSec = ((Date.now() - startAll) / 1000).toFixed(1);
  const overall    = completed > 0 ? Math.round(completed / parseFloat(elapsedSec)) : 0;
  const pct        = Math.min(100, Math.round((completed / TOTAL_REQS) * 100));
  const fillLen    = Math.round(pct / 2);
  const progBar    = cyan('█'.repeat(fillLen)) + dim('░'.repeat(50 - fillLen));

  const maxRps = Math.max(...buckets.map(b => Math.max(b.instantRps, b.avgRps)), 1);
  const maxLat = Math.max(...buckets.map(b => Math.max(b.instantLat, b.avgLat)), 1);

  const subCols = CHART_W * 2;
  const padded  = (key) => {
    const vals = buckets.map(b => b[key]);
    const p    = subCols - vals.length;
    return p > 0 ? [...Array(p).fill(null), ...vals] : vals.slice(-subCols);
  };

  const rpsLines = brailleChart(padded('avgRps'),     padded('instantRps'), maxRps, dim, green);
  const latLines = brailleChart(padded('avgLat'),     padded('instantLat'), maxLat, dim, magenta);

  const yLbl = (row, maxV) => {
    if (row === 0)                    return yellow(String(maxV).padStart(6) + ' ┤');
    if (row === Math.floor(CHART_H / 2)) return dim(String(Math.round(maxV / 2)).padStart(6) + ' ┤');
    if (row === CHART_H - 1)          return dim('     0 ┤');
    return '       │';
  };

  const nowSec   = parseFloat(elapsedSec);
  const winSec   = (CHART_W * 2 * BUCKET_MS) / 1000;
  const leftSec  = Math.max(0, nowSec - winSec);
  const fmt      = s => s.toFixed(0) + 's';
  let xAxis = ' '.repeat(CHART_W);
  const placeX = (str, pos) => {
    const p = Math.max(0, Math.min(pos, CHART_W - str.length));
    xAxis = xAxis.slice(0, p) + str + xAxis.slice(p + str.length);
  };
  placeX(fmt(leftSec),                    0);
  placeX(fmt(leftSec + winSec / 2),       Math.floor(CHART_W / 2) - 2);
  placeX(fmt(nowSec),                     CHART_W - fmt(nowSec).length);

  const border = dim('─'.repeat(CHART_W));
  const vbar   = dim('│');

  const lines = [
    '',
    bold(cyan('  ⚡  UserService Load Test')),
    `     Target      : ${dim(HOST)}`,
    `     Concurrency : ${CONCURRENCY} workers   Total: ${TOTAL_REQS}   In-flight: ${cyan(String(inFlight))}`,
    '',
    `     Progress  ${String(pct).padStart(3)}%  [${progBar}]`,
    `     Completed : ${completed} / ${TOTAL_REQS}   Passed: ${green(String(passed).padStart(5))}   Failed: ${failed > 0 ? red(String(failed).padStart(5)) : String(failed).padStart(5)}`,
    `     Elapsed   : ${elapsedSec}s   Overall: ${overall} req/s`,
    '',
    bold('  Throughput  (req/s)'),
    `     ${green('⎯')} instant (last bucket)   ${dim('⎯')} rolling-${ROLLING_N} avg` +
      `    →  ${green(instRps + ' r/s')}  avg ${yellow(avgRps + ' r/s')}`,
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...rpsLines.map((row, i) => `  ${yLbl(i, maxRps)}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(xAxis)}`,
    '',
    bold('  Latency  (ms)'),
    `     ${magenta('⎯')} instant (last bucket)   ${dim('⎯')} rolling-${ROLLING_N} avg` +
      `    →  ${magenta(instLat + ' ms')}  avg ${yellow(avgLat + ' ms')}`,
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...latLines.map((row, i) => `  ${yLbl(i, maxLat)}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(xAxis)}`,
    '',
  ];

  let out = goto(1, 1);
  for (const l of lines) out += clrLine() + l + '\n';
  out += '\x1b[?25l';
  process.stdout.write(out);
}

// ── HTTP ──────────────────────────────────────────────────────────────────────
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

// ── Worker pool ───────────────────────────────────────────────────────────────
// Each worker independently loops: fire → record → fire → record ...
// As soon as any request finishes the slot immediately sends the next one.
// Exactly CONCURRENCY requests are in-flight at all times (until we run out).
function runPool(token) {
  return new Promise((resolve) => {
    let dispatched = 0;   // total requests handed out to workers
    let settled    = 0;   // total requests fully completed

    function next(workerId) {
      if (dispatched >= TOTAL_REQS) {
        // This worker is done; check if all workers are done
        if (settled >= TOTAL_REQS) resolve();
        return;
      }

      const reqIndex = dispatched++;
      inFlight++;

      signup(token, reqIndex).then(r => {
        inFlight--;
        settled++;
        const now = Date.now();
        ring.push({ ts: now, ms: r.ms, ok: r.ok });
        if (r.ok) passed++; else failed++;
        completed++;
        if (ring.length > ROLLING_N * 4) ring.splice(0, ring.length - ROLLING_N * 4);

        if (settled >= TOTAL_REQS) {
          resolve();
        } else {
          next(workerId);   // immediately fire the next request on this worker
        }
      });
    }

    // Spawn exactly CONCURRENCY workers
    const workers = Math.min(CONCURRENCY, TOTAL_REQS);
    for (let w = 0; w < workers; w++) next(w);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  process.stdout.write('\x1b[2J\x1b[H\x1b[?25l');

  const cleanup = () => process.stdout.write('\x1b[?25h\n');
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('exit', cleanup);

  process.stdout.write(goto(1, 1) + bold(cyan('  ⚡  UserService Load Test\n')));
  process.stdout.write(clrLine() + `     Fetching OAuth token...`);
  const token = await getToken();
  process.stdout.write('  ' + green('✓') + '\n');

  startAll            = Date.now();
  lastBucketTs        = startAll;
  lastBucketCompleted = 0;

  const interval = setInterval(() => {
    maybePushBucket();
    render();
  }, BUCKET_MS);

  await runPool(token);

  clearInterval(interval);
  maybePushBucket();
  render();

  // Final summary
  const totalMs  = Date.now() - startAll;
  const lats     = ring.map(r => r.ms).sort((a, b) => a - b);
  const p50      = lats[Math.floor(lats.length * 0.50)] ?? 'n/a';
  const p95      = lats[Math.floor(lats.length * 0.95)] ?? 'n/a';
  const p99      = lats[Math.floor(lats.length * 0.99)] ?? 'n/a';
  const avgFinal = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;

  const liveLines = 10 + (CHART_H + 5) * 2;
  let out = goto(liveLines + 1, 1);
  const summary = [
    bold('  ── Final Results ─────────────────────────────────'),
    `     Total time  : ${(totalMs / 1000).toFixed(2)}s`,
    `     Throughput  : ${Math.round(TOTAL_REQS / (totalMs / 1000))} req/s`,
    `     Passed      : ${green(String(passed))}`,
    `     Failed      : ${failed > 0 ? red(String(failed)) : String(failed)}`,
    `     Latency avg : ${avgFinal}ms`,
    `     p50 / p95 / p99 : ${p50}ms / ${yellow(p95 + 'ms')} / ${p99 > 2000 ? red(p99 + 'ms') : yellow(p99 + 'ms')}`,
    '',
  ];
  for (const l of summary) out += clrLine() + l + '\n';
  process.stdout.write(out + '\x1b[?25h');
}

main().catch(e => {
  process.stdout.write('\x1b[?25h\n');
  console.error(red('\n  ❌ Fatal: ' + e.message));
  process.exit(1);
});