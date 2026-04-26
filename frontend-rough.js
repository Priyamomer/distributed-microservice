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
const CONCURRENCY   = parseInt(args.concurrency || '1000');
const TOTAL_REQS    = parseInt(args.requests    || '1000000');

const SAMPLE_PCT    = 0.90;
const SAMPLE_CUTOFF = Math.floor(TOTAL_REQS * SAMPLE_PCT);

// ── Chart config ──────────────────────────────────────────────────────────────
const CHART_W    = 80;
const CHART_H    = 8;
const BUCKET_MS  = 500;
const ROLLING_N  = 100;
const BATCH_SIZE = 1000;

// Progress snapshot every PCT_INTERVAL percent (1% = every 10,000 reqs for 1M)
const PCT_INTERVAL    = 0.1;
const PCT_SNAP_EVERY  = Math.floor(TOTAL_REQS * (PCT_INTERVAL / 100));

// ── ANSI ──────────────────────────────────────────────────────────────────────
const R       = '\x1b[0m';
const green   = s => `\x1b[32m${s}${R}`;
const red     = s => `\x1b[31m${s}${R}`;
const yellow  = s => `\x1b[33m${s}${R}`;
const cyan    = s => `\x1b[36m${s}${R}`;
const magenta = s => `\x1b[35m${s}${R}`;
const blue    = s => `\x1b[34m${s}${R}`;
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

function brailleChartMulti(series, maxVal) {
  const subCols = CHART_W * 2;
  const subRows = CHART_H * 4;

  const toRow = v => {
    if (v === null || v === undefined) return null;
    return Math.round(Math.max(0, Math.min(subRows - 1, (v / maxVal) * (subRows - 1))));
  };

  const grids = series.map(() =>
    Array.from({ length: CHART_H }, () => new Uint8Array(CHART_W))
  );

  const paintDot = (grid, subCol, subRow) => {
    if (subRow === null) return;
    const bCol   = Math.floor(subCol / 2);
    const dotCol = subCol % 2;
    const bRow   = Math.floor((subRows - 1 - subRow) / 4);
    const dotRow = (subRows - 1 - subRow) % 4;
    if (bRow < 0 || bRow >= CHART_H) return;
    grid[bRow][bCol] |= BRAILLE_BIT[dotRow][dotCol];
  };

  series.forEach(({ data }, si) => {
    const rows = data.map(toRow);
    for (let col = 0; col < subCols; col++) {
      const r = rows[col];
      if (r === null) continue;
      paintDot(grids[si], col, r);
      if (col > 0 && rows[col - 1] !== null) {
        const r0 = rows[col - 1], r1 = r;
        const steps = Math.abs(r1 - r0);
        for (let s = 1; s < steps; s++) {
          const mid = Math.round(r0 + (r1 - r0) * (s / steps));
          paintDot(grids[si], col - 1 + (s / steps < 0.5 ? 0 : 1), mid);
        }
      }
    }
  });

  const lines = [];
  for (let bRow = 0; bRow < CHART_H; bRow++) {
    let line = '';
    for (let bCol = 0; bCol < CHART_W; bCol++) {
      let ch = ' ';
      for (let si = 0; si < grids.length; si++) {
        const bits = grids[si][bRow][bCol];
        if (bits !== 0) ch = series[si].color(String.fromCodePoint(BRAILLE_BASE | bits));
      }
      line += ch;
    }
    lines.push(line);
  }
  return lines;
}

function brailleChart(seriesA, seriesB, maxVal, colorA, colorB) {
  return brailleChartMulti(
    [{ data: seriesA, color: colorA }, { data: seriesB, color: colorB }],
    maxVal
  );
}

// ── State ─────────────────────────────────────────────────────────────────────
let completed = 0, passed = 0, failed = 0, inFlight = 0;
let startAll, lastBucketTs, lastBucketCompleted = 0;
const ring    = [];
const buckets = [];

// ── Batch tracking ────────────────────────────────────────────────────────────
const batchTimes = [];
let   batchStart = null;
let   lastBatchN = 0;

// ── Progress snapshots ────────────────────────────────────────────────────────
const pctSnaps   = [];
let   lastSnapAt = 0;
const snapWindow = [];      // latency entries for current window
let   snapWinStart = null;  // ← timestamp when the current snapshot window began
                            //   FIX: RPS = PCT_SNAP_EVERY / (now - snapWinStart)
                            //   not PCT_SNAP_EVERY / (now - startAll)

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

function maybePushBatch(now) {
  if (batchStart === null) batchStart = now;
  const batchesDone = Math.floor(completed / BATCH_SIZE);
  const prevBatches = Math.floor(lastBatchN  / BATCH_SIZE);
  if (batchesDone > prevBatches) {
    batchTimes.push(now - batchStart);
    if (batchTimes.length > CHART_W * 2) batchTimes.shift();
    batchStart = now;
    lastBatchN = completed;
  }
}

// ── FIX: RPS measured over the actual wall-clock time of this 1% window ──────
function maybePushPctSnap(ms, now) {
  // Initialise window start on the very first request
  if (snapWinStart === null) snapWinStart = now;

  snapWindow.push(ms);
  // keep at most one window worth of entries (no stale data from prev windows)
  if (snapWindow.length > PCT_SNAP_EVERY) snapWindow.shift();

  const snapsDone = Math.floor(completed / PCT_SNAP_EVERY);
  const prevSnaps = Math.floor(lastSnapAt / PCT_SNAP_EVERY);

  if (snapsDone > prevSnaps && snapWindow.length >= 10) {
    const pct = Math.round((completed / TOTAL_REQS) * 100);

    // ── THE FIX ──────────────────────────────────────────────────────────────
    // windowMs = time elapsed since this snapshot window started.
    // This is always ~(PCT_SNAP_EVERY / actual_rps) seconds regardless of
    // how long the overall test has been running.
    // The old code used (now - startAll) which grows forever → RPS shrank.
    const windowMs = Math.max(now - snapWinStart, 1);
    const rps      = Math.round((PCT_SNAP_EVERY / windowMs) * 1000);
    // ─────────────────────────────────────────────────────────────────────────

    const sorted = [...snapWindow].sort((a, b) => a - b);
    const p      = frac => sorted[Math.floor(sorted.length * frac)] ?? 0;

    pctSnaps.push({
      pct,
      rps,
      avgLat : Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
      p50    : p(0.50),
      p95    : p(0.95),
      p99    : p(0.99),
    });

    if (pctSnaps.length > CHART_W * 2) pctSnaps.shift();

    lastSnapAt    = completed;
    snapWinStart  = now;   // reset window start for next snapshot
    snapWindow.length = 0; // clear — start fresh for next window
  }
}

// ── Pad series to chart width ─────────────────────────────────────────────────
function padSeries(arr, fill = null) {
  const subCols = CHART_W * 2;
  const p = subCols - arr.length;
  return p > 0 ? [...Array(p).fill(fill), ...arr] : arr.slice(-subCols);
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const { lat: avgLat } = rollingAvg();
  const last    = buckets[buckets.length - 1];
  const instLat = last?.instantLat ?? 0;

  const elapsedSec = ((Date.now() - startAll) / 1000).toFixed(1);
  const overall    = completed > 0 ? Math.round(completed / parseFloat(elapsedSec)) : 0;
  const pct        = Math.min(100, Math.round((completed / TOTAL_REQS) * 100));
  const fillLen    = Math.round(pct / 2);
  const progBar    = cyan('█'.repeat(fillLen)) + dim('░'.repeat(50 - fillLen));

  const subCols = CHART_W * 2;
  const border  = dim('─'.repeat(CHART_W));
  const vbar    = dim('│');

  const yLbl = (row, maxV, unit = '') => {
    if (row === 0)                       return yellow(String(maxV).padStart(6) + unit + ' ┤');
    if (row === Math.floor(CHART_H / 2)) return dim(String(Math.round(maxV / 2)).padStart(6) + unit + ' ┤');
    if (row === CHART_H - 1)             return dim('     0' + unit + ' ┤');
    return '        │';
  };

  // x-axis: time
  const nowSec  = parseFloat(elapsedSec);
  const winSec  = (subCols * BUCKET_MS) / 1000;
  const leftSec = Math.max(0, nowSec - winSec);
  const fmtS    = s => s.toFixed(0) + 's';
  const timeXAxis = (() => {
    let x = ' '.repeat(CHART_W);
    const place = (str, pos) => {
      const p = Math.max(0, Math.min(pos, CHART_W - str.length));
      x = x.slice(0, p) + str + x.slice(p + str.length);
    };
    place(fmtS(leftSec),              0);
    place(fmtS(leftSec + winSec / 2), Math.floor(CHART_W / 2) - 2);
    place(fmtS(nowSec),               CHART_W - fmtS(nowSec).length);
    return x;
  })();

  // x-axis: batch
  const batchXAxis = (() => {
    const total  = batchTimes.length;
    const startN = Math.max(0, total - subCols / 2);
    let x = ' '.repeat(CHART_W);
    const place = (str, pos) => {
      const p = Math.max(0, Math.min(pos, CHART_W - str.length));
      x = x.slice(0, p) + str + x.slice(p + str.length);
    };
    place(startN + 'K',                             0);
    place(Math.round(startN + (total - startN) / 2) + 'K', Math.floor(CHART_W / 2) - 2);
    place(total + 'K',                              CHART_W - String(total).length - 1);
    return x;
  })();

  // x-axis: progress %
  const pctXAxis = (() => {
    const startP = pctSnaps.length > 0 ? pctSnaps[Math.max(0, pctSnaps.length - subCols / 2)].pct : 0;
    const endP   = pctSnaps.length > 0 ? pctSnaps[pctSnaps.length - 1].pct : pct;
    let x = ' '.repeat(CHART_W);
    const place = (str, pos) => {
      const p = Math.max(0, Math.min(pos, CHART_W - str.length));
      x = x.slice(0, p) + str + x.slice(p + str.length);
    };
    place(startP + '%',                          0);
    place(Math.round((startP + endP) / 2) + '%', Math.floor(CHART_W / 2) - 2);
    place(endP + '%',                            CHART_W - String(endP).length - 1);
    return x;
  })();

  // Chart 1: batch time
  const maxBatch   = Math.max(...batchTimes, 1);
  const minBatch   = Math.min(...batchTimes, maxBatch);
  const inverted   = padSeries(batchTimes.map(v => maxBatch - v));
  const smoothed   = padSeries(batchTimes.map((_, i, a) => {
    const win = a.slice(Math.max(0, i - 4), i + 1);
    return maxBatch - Math.round(win.reduce((s, x) => s + x, 0) / win.length);
  }));
  const batchLines = brailleChart(smoothed, inverted, maxBatch, dim, cyan);
  const batchYLbl  = row => {
    const pad = n => String(n).padStart(6);
    if (row === 0)                       return yellow(pad(maxBatch) + 'ms ┤');
    if (row === Math.floor(CHART_H / 2)) return dim(pad(Math.round((maxBatch + minBatch) / 2)) + 'ms ┤');
    if (row === CHART_H - 1)             return dim(pad(minBatch) + 'ms ┤');
    return '         │';
  };
  const currentBatchMs   = batchTimes[batchTimes.length - 1] ?? 0;
  const batchesCompleted = batchTimes.length;

  // Chart 2: RPS by progress %
  const rpsSnap    = pctSnaps.map(s => s.rps);
  const maxRpsSnap = Math.max(...rpsSnap, 1);
  const rpsLines   = brailleChart(padSeries(rpsSnap), padSeries(rpsSnap), maxRpsSnap, dim, green);

  // Chart 3: percentiles by progress %
  const p50s      = pctSnaps.map(s => s.p50);
  const p95s      = pctSnaps.map(s => s.p95);
  const p99s      = pctSnaps.map(s => s.p99);
  const maxPctLat = Math.max(...p99s, 1);
  const pctLines  = brailleChartMulti([
    { data: padSeries(p50s), color: green  },
    { data: padSeries(p95s), color: yellow },
    { data: padSeries(p99s), color: red    },
  ], maxPctLat);

  const curSnap = pctSnaps[pctSnaps.length - 1];

  // Chart 4: live latency
  const maxLat  = Math.max(...buckets.map(b => Math.max(b.instantLat, b.avgLat)), 1);
  const padded  = key => {
    const vals = buckets.map(b => b[key]);
    const p    = subCols - vals.length;
    return p > 0 ? [...Array(p).fill(null), ...vals] : vals.slice(-subCols);
  };
  const latLines = brailleChart(padded('avgLat'), padded('instantLat'), maxLat, dim, magenta);

  const lines = [
    '',
    bold(cyan('  ⚡  UserService Load Test  ') + dim('— scaling observer')),
    `     Target      : ${dim(HOST)}`,
    `     Concurrency : ${CONCURRENCY} workers   Total: ${TOTAL_REQS.toLocaleString()}   In-flight: ${cyan(String(inFlight))}`,
    `     Stats window: first ${SAMPLE_PCT * 100}% of requests (${SAMPLE_CUTOFF.toLocaleString()} / ${TOTAL_REQS.toLocaleString()})`,
    '',
    `     Progress  ${String(pct).padStart(3)}%  [${progBar}]`,
    `     Completed : ${completed.toLocaleString()} / ${TOTAL_REQS.toLocaleString()}   Passed: ${green(String(passed).padStart(7))}   Failed: ${failed > 0 ? red(String(failed).padStart(5)) : String(failed).padStart(5)}`,
    `     Elapsed   : ${elapsedSec}s   Overall: ${overall} req/s`,
    '',
    bold('  ① Time per 1,000 requests  (ms)') + '   ' + dim('high = slow  →  drops as pods join  →  flat = full capacity'),
    `     ${cyan('⎯')} each batch   ${dim('⎯')} smoothed    →  last: ${currentBatchMs > 0 ? cyan(currentBatchMs + 'ms') : dim('...')}   batches: ${yellow(String(batchesCompleted))}`,
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...batchLines.map((row, i) => `  ${batchYLbl(i)}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(batchXAxis)}  ${dim('(×1,000 reqs)')}`,
    '',
    bold('  ② RPS at each 1% window') + '   ' + dim('each bar = reqs in that 1% ÷ time that 1% took  →  rises as pods join'),
    `     ${green('⎯')} rps per 1% window    →  now: ${green((curSnap?.rps ?? 0) + ' r/s')}`,
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...rpsLines.map((row, i) => `  ${yLbl(i, maxRpsSnap)}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(pctXAxis)}  ${dim('(% progress)')}`,
    '',
    bold('  ③ Latency percentiles at each 1% window') + '   ' + dim('drops as pods join'),
    `     ${green('⎯')} p50   ${yellow('⎯')} p95   ${red('⎯')} p99` +
      (curSnap ? `    →  p50: ${green(curSnap.p50 + 'ms')}  p95: ${yellow(curSnap.p95 + 'ms')}  p99: ${red(curSnap.p99 + 'ms')}` : ''),
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...pctLines.map((row, i) => `  ${yLbl(i, maxPctLat, 'ms')}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(pctXAxis)}  ${dim('(% progress)')}`,
    '',
    bold('  ④ Live latency  (ms)'),
    `     ${magenta('⎯')} instant   ${dim('⎯')} rolling-${ROLLING_N} avg    →  ${magenta(instLat + ' ms')}  avg ${yellow(avgLat + ' ms')}`,
    `       ${dim('┌')}${border}${dim('┐')}`,
    ...latLines.map((row, i) => `  ${yLbl(i, maxLat, 'ms')}${row}${vbar}`),
    `       ${dim('└')}${border}${dim('┘')}`,
    `         ${dim(timeXAxis)}`,
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
function runPool(token) {
  return new Promise((resolve) => {
    let dispatched = 0;
    let settled    = 0;

    function next(workerId) {
      if (dispatched >= TOTAL_REQS) {
        if (settled >= TOTAL_REQS) resolve();
        return;
      }

      const reqIndex = dispatched++;
      inFlight++;

      signup(token, reqIndex).then(r => {
        inFlight--;
        settled++;
        const now = Date.now();

        if (completed < SAMPLE_CUTOFF) {
          ring.push({ ts: now, ms: r.ms, ok: r.ok });
          if (r.ok) passed++; else failed++;
          if (ring.length > ROLLING_N * 4) ring.splice(0, ring.length - ROLLING_N * 4);
        }

        completed++;
        maybePushBatch(now);
        maybePushPctSnap(r.ms, now);

        if (settled >= TOTAL_REQS) {
          resolve();
        } else {
          next(workerId);
        }
      });
    }

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

  // ── Final summary ──────────────────────────────────────────────────────────
  const totalMs          = Date.now() - startAll;
  const lats             = ring.map(r => r.ms).sort((a, b) => a - b);
  const p50              = lats[Math.floor(lats.length * 0.50)] ?? 'n/a';
  const p95              = lats[Math.floor(lats.length * 0.95)] ?? 'n/a';
  const p99              = lats[Math.floor(lats.length * 0.99)] ?? 'n/a';
  const avgFinal         = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
  const sampleThroughput = Math.round(SAMPLE_CUTOFF / (totalMs / 1000));

  const firstBatch  = batchTimes[0] ?? 0;
  const lastBatchMs = batchTimes[batchTimes.length - 1] ?? 0;
  const improvement = firstBatch > 0
    ? ((1 - lastBatchMs / firstBatch) * 100).toFixed(1)
    : '0.0';

  const snapTable = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => {
    const snap = pctSnaps.find(s => s.pct >= p);
    return snap
      ? `     ${String(p + '%').padStart(4)}  │  ${String(snap.rps).padStart(6)} r/s  │  p50: ${String(snap.p50).padStart(5)}ms  p95: ${String(snap.p95).padStart(6)}ms  p99: ${String(snap.p99).padStart(6)}ms`
      : `     ${String(p + '%').padStart(4)}  │  ${'—'.padStart(9)}  │  —`;
  });

  const liveLines = 17 + (CHART_H + 5) * 4;
  let out = goto(liveLines + 1, 1);
  const summary = [
    bold('  ── Final Results ─────────────────────────────────'),
    dim(`     (stats based on first ${SAMPLE_PCT * 100}% = ${SAMPLE_CUTOFF.toLocaleString()} reqs)`),
    `     Total time      : ${(totalMs / 1000).toFixed(2)}s`,
    `     Throughput      : ${sampleThroughput} req/s`,
    `     Passed          : ${green(String(passed))}`,
    `     Failed          : ${failed > 0 ? red(String(failed)) : String(failed)}`,
    `     Latency avg     : ${avgFinal}ms`,
    `     p50 / p95 / p99 : ${p50}ms / ${yellow(p95 + 'ms')} / ${p99 > 2000 ? red(p99 + 'ms') : yellow(p99 + 'ms')}`,
    '',
    bold('  ── Batch Time (ms per 1,000 reqs) ─────────────────'),
    `     First batch  : ${red(firstBatch + 'ms')}   ${dim('← cold start')}`,
    `     Last batch   : ${green(lastBatchMs + 'ms')}   ${dim('← all pods alive')}`,
    `     Improvement  : ${yellow(improvement + '%')} faster by end`,
    '',
    bold('  ── RPS & Latency by Progress % ─────────────────────'),
    `     ${'PCT'.padStart(4)}  │  ${'RPS'.padStart(9)}  │  Latency percentiles`,
    `     ${'────'.padStart(4)}  │  ${'─────────'.padStart(9)}  │  ──────────────────────────────`,
    ...snapTable,
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