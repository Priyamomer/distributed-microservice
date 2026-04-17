// load-test.js  —  Live terminal dashboard + auto-tune mode
// Usage:
//   node load-test.js                               # default: 20 concurrent, 60s
//   node load-test.js --concurrency 50 --duration 60
//   node load-test.js --tune                        # auto-find peak RPS
//   node load-test.js --tune --step 10 --max 200   # tune from 10 to 200, step 10

const GATEWAY             = 'http://62.238.15.118:8000';
const USER_SERVICE_DIRECT = 'http://62.238.15.118:8200';
const CLIENT_ID           = 'productService';
const CLIENT_SECRET       = 'productServiceSecret';

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
    process.argv.slice(2)
        .reduce((acc, v, i, a) => { if (v.startsWith('--')) acc.push([v.slice(2), a[i+1]]); return acc; }, [])
);
const CONCURRENCY   = parseInt(args.concurrency || '20');
const DURATION_MS   = parseInt(args.duration    || '60') * 1000;
const MAX_REQUESTS  = args.requests ? parseInt(args.requests) : null;
const RAMP_MS       = parseInt(args.ramp        || '3') * 1000;
const TUNE_MODE     = 'tune' in args;
const TUNE_STEP     = parseInt(args.step  || '10');
const TUNE_MAX      = parseInt(args.max   || '150');
const TUNE_DURATION = parseInt(args.each  || '15') * 1000; // seconds per step

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const A = {
    reset:      '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    red:        '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    cyan:       '\x1b[36m', white: '\x1b[37m', magenta: '\x1b[35m',
    bgRed:      '\x1b[41m', bgGreen: '\x1b[42m', bgMagenta: '\x1b[45m',
    hideCursor: '\x1b[?25l', showCursor: '\x1b[?25h',
    moveTo: (r, c) => `\x1b[${r};${c}H`,
};
function c(...codes) { return s => codes.join('') + s + A.reset; }
const bold    = c(A.bold);
const dim     = c(A.dim);
const red     = c(A.red);
const green   = c(A.green);
const yellow  = c(A.yellow);
const cyan    = c(A.cyan);
const white   = c(A.white);
const magenta = c(A.magenta);
const redBg   = c(A.bgRed,     A.bold, A.white);
const greenBg = c(A.bgGreen,   A.bold, A.white);
const magBg   = c(A.bgMagenta, A.bold, A.white);
function vis(s) { return s.replace(/\x1b\[[0-9;]*m/g, ''); }

// ── Sparkline ─────────────────────────────────────────────────────────────────
const SPARKS = '▁▂▃▄▅▆▇█';
function sparkline(samples) {
    if (samples.length < 2) return dim('no data yet');
    const max = Math.max(...samples, 1);
    return cyan(samples.map(v => SPARKS[Math.min(7, Math.floor((v / max) * 7))]).join(''));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
class Stats {
    constructor() {
        this.total = 0; this.errors = 0;
        this.byName = {}; this.errorLog = [];
        this.rpsSamples = []; this._lastSnap = 0;
        this.startMs = Date.now();
    }
    record({ name, status, latencyMs, errorBody }) {
        this.total++;
        const ok = status >= 200 && status < 300;
        if (!ok) {
            this.errors++;
            this.errorLog.push({ time: new Date().toISOString().slice(11,19), name, status, body: (errorBody||'').slice(0,70) });
            if (this.errorLog.length > 8) this.errorLog.shift();
        }
        if (!this.byName[name]) this.byName[name] = { count:0, errors:0, latencies:[], codes:{} };
        const b = this.byName[name];
        b.count++; if (!ok) b.errors++;
        b.latencies.push(latencyMs);
        b.codes[status] = (b.codes[status]||0) + 1;
    }
    snapRps() {
        const snap = this.total - this._lastSnap;
        this._lastSnap = this.total;
        this.rpsSamples.push(snap);
        if (this.rpsSamples.length > 40) this.rpsSamples.shift();
    }
    elapsed()    { return (Date.now() - this.startMs) / 1000; }
    currentRps() { return (this.total / Math.max(this.elapsed(), 0.1)).toFixed(1); }
    pct(arr, p)  { if (!arr.length) return 0; const s=[...arr].sort((a,b)=>a-b); return s[Math.max(0,Math.ceil(p/100*s.length)-1)]; }
    avg(arr)     { return arr.length ? Math.round(arr.reduce((a,v)=>a+v,0)/arr.length) : 0; }
    // stable RPS = avg of last N rps samples
    stableRps(n=8) {
        const tail = this.rpsSamples.slice(-n);
        return tail.length ? tail.reduce((a,v)=>a+v,0)/tail.length : 0;
    }
}

// ── Auth & Seed ───────────────────────────────────────────────────────────────
function basicAuth() { return 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'); }
async function getToken() {
    const res  = await fetch(`${USER_SERVICE_DIRECT}/oauth2/token`, {
        method:'POST', headers:{'Authorization':basicAuth(),'Content-Type':'application/x-www-form-urlencoded'},
        body:'grant_type=client_credentials&scope=openid'
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Token failed: '+JSON.stringify(data));
    return data.access_token;
}
async function fetchProductIds(token) {
    const res = await fetch(`${GATEWAY}/v1/products`, { headers:{'Authorization':`Bearer ${token}`} });
    if (!res.ok) throw new Error(`GET /v1/products → ${res.status}`);
    const products = await res.json();
    if (!Array.isArray(products)||!products.length) throw new Error('No products — add seed data first');
    return products.map(p=>p.id);
}

// ── Scenarios ─────────────────────────────────────────────────────────────────
function pickRandom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function buildScenarios(token, productIds) {
    const auth = {'Authorization':`Bearer ${token}`,'Content-Type':'application/json'};
    async function req(name, method, path, body) {
        const t = Date.now(); let status=0, errorBody='';
        try {
            const res = await fetch(`${GATEWAY}${path}`, { method, headers:auth, ...(body?{body:JSON.stringify(body)}:{}) });
            status = res.status;
            if (status<200||status>=300) errorBody = await res.text().catch(()=>'');
            else await res.text();
        } catch(e) { status=0; errorBody=e.message; }
        return { name, status, latencyMs:Date.now()-t, errorBody };
    }
    return [
        ()=>req('POST /v1/products','POST','/v1/products',{title:'LT-'+Date.now(),description:'load test',price:1.0,image:'https://via.placeholder.com/150',category:'Electronics'}),
        ()=>req('POST /v1/products','POST','/v1/products',{title:'ST-'+Math.random().toString(36).slice(2),description:'stress',price:9.99,image:'https://via.placeholder.com/150',category:'Books'}),
    ];
}

// ── Worker ────────────────────────────────────────────────────────────────────
async function worker(scenarios, stats, stopSignal) {
    while (!stopSignal.stop) {
        if (MAX_REQUESTS!==null && stats.total>=MAX_REQUESTS) break;
        stats.record(await pickRandom(scenarios)());
    }
}

// ── Dashboard renderer ────────────────────────────────────────────────────────
function latCol(ms) {
    if (ms<100) return green(`${ms}ms`);
    if (ms<500) return yellow(`${ms}ms`);
    return red(`${ms}ms`);
}
function codeBadge(code) {
    if (code===0)              return redBg(' NET ');
    if (code>=200&&code<300)   return greenBg(` ${code} `);
    if (code>=400&&code<500)   return yellow(` ${code} `);
    return red(` ${code} `);
}

function renderDashboard(stats, concurrency, tuneResults=[]) {
    const W       = Math.min(process.stdout.columns||110, 120);
    const elapsed = stats.elapsed().toFixed(1);
    const timeLeft = MAX_REQUESTS
        ? `${Math.max(0,MAX_REQUESTS-stats.total)} reqs left`
        : `${Math.max(0,DURATION_MS/1000-parseFloat(elapsed)).toFixed(0)}s left`;
    const errRate  = stats.total ? ((stats.errors/stats.total)*100).toFixed(1) : '0.0';
    const rps      = stats.currentRps();
    const spark    = sparkline(stats.rpsSamples);
    const isHealthy= parseFloat(errRate)<5;
    const HR       = dim('─'.repeat(W-4));

    function row(content) {
        const v = vis(content);
        const pad = Math.max(0, W-2-v.length);
        return cyan('│')+content+' '.repeat(pad)+cyan('│');
    }
    function hr() { return row('  '+HR); }

    const lines = [
        '',
        cyan('┌─ ')+bold(cyan('⚡ LOAD TEST — LIVE DASHBOARD'))+cyan(' '+'─'.repeat(Math.max(0,W-33))+'┐'),
        row(`  ${dim('Gateway:')} ${white(GATEWAY)}   ${dim('Workers:')} ${bold(String(concurrency))}   ${dim('Elapsed:')} ${bold(cyan(elapsed+'s'))}   ${dim(timeLeft)}`),
        hr(),
        row(`  ${dim('REQUESTS')} ${bold(white(String(stats.total).padStart(7)))}    ${dim('ERRORS')} ${isHealthy?green(String(stats.errors).padStart(5)):red(String(stats.errors).padStart(5))} ${dim('(')}${isHealthy?green(errRate+'%'):red(errRate+'%')}${dim(')')}    ${dim('RPS')} ${bold(cyan(rps.padStart(8)))}    ${dim('trend')} ${spark}`),
        hr(),
        row(`  ${dim('ENDPOINT'.padEnd(26))} ${dim('COUNT'.padStart(7))} ${dim('ERRORS'.padStart(7))} ${dim('AVG'.padStart(8))} ${dim('P50'.padStart(8))} ${dim('P95'.padStart(8))} ${dim('P99'.padStart(8))}  ${dim('CODES')}`),
        hr(),
    ];

    for (const [name, b] of Object.entries(stats.byName)) {
        const p50=stats.pct(b.latencies,50), p95=stats.pct(b.latencies,95), p99=stats.pct(b.latencies,99), avg=stats.avg(b.latencies);
        const hasE=b.errors>0;
        const codes=Object.entries(b.codes).sort((a,b)=>b[1]-a[1]).map(([code,n])=>`${codeBadge(parseInt(code))}${dim('×'+n)}`).join(' ');
        lines.push(row(`  ${hasE?yellow(name.padEnd(26)):white(name.padEnd(26))} ${String(b.count).padStart(7)} ${hasE?red(String(b.errors).padStart(7)):green('      0')}   ${latCol(avg)}    ${latCol(p50)}    ${latCol(p95)}    ${latCol(p99)}   ${codes}`));
    }

    lines.push(hr());
    lines.push(row(`  ${bold(red('RECENT ERRORS'))}`));
    if (stats.errorLog.length===0) {
        lines.push(row(`  ${green('✓ No errors recorded')}`));
    } else {
        for (const e of [...stats.errorLog].reverse()) {
            lines.push(row(`  ${dim(e.time)}  ${codeBadge(e.status)}  ${yellow(e.name)}${e.body?dim('  →  '+e.body):''}`));
        }
    }

    // ── Tune results table (only in tune mode) ────────────────────────────
    if (tuneResults.length > 0) {
        lines.push(hr());
        lines.push(row(`  ${bold(magenta('⚡ AUTO-TUNE RESULTS'))}`));
        lines.push(row(`  ${dim('CONCURRENCY'.padEnd(14))} ${dim('RPS'.padStart(8))} ${dim('AVG LAT'.padStart(9))} ${dim('P95'.padStart(9))} ${dim('ERR%'.padStart(7))}  ${dim('STATUS')}`));
        lines.push(row('  '+dim('─'.repeat(W-6))));

        const maxRps = Math.max(...tuneResults.map(r=>r.rps));
        for (const r of tuneResults) {
            const isPeak = r.rps === maxRps;
            const concCol = isPeak ? magBg(` ${String(r.concurrency).padStart(3)} `) : dim(String(r.concurrency).padStart(6));
            const rpsCol  = isPeak ? bold(magenta(r.rps.toFixed(1).padStart(8))) : cyan(r.rps.toFixed(1).padStart(8));
            const errCol  = r.errPct > 5 ? red(r.errPct.toFixed(1).padStart(6)+'%') : green(r.errPct.toFixed(1).padStart(6)+'%');
            const bar     = '█'.repeat(Math.round((r.rps/maxRps)*20)).padEnd(20);
            const barCol  = isPeak ? magenta(bar) : dim(bar);
            const label   = isPeak ? bold(magenta(' ← PEAK')) : '';
            lines.push(row(`  ${concCol}  ${rpsCol}  ${latCol(Math.round(r.avgLat)).padEnd(9)}  ${latCol(Math.round(r.p95)).padEnd(9)}  ${errCol}  ${barCol}${label}`));
        }

        if (tuneResults.length > 0) {
            const peak = tuneResults.reduce((a,b)=>a.rps>b.rps?a:b);
            lines.push(row('  '+dim('─'.repeat(W-6))));
            lines.push(row(`  ${bold('Peak RPS:')} ${bold(magenta(peak.rps.toFixed(1)))}  at  ${bold(magenta('concurrency='+peak.concurrency))}  avg=${peak.avgLat.toFixed(0)}ms  p95=${peak.p95.toFixed(0)}ms`));
        }
    }

    lines.push(cyan('└'+'─'.repeat(W-2)+'┘'));
    lines.push('');
    return lines.join('\n');
}

// ── Redraw helper ─────────────────────────────────────────────────────────────
let lastLineCount = 0;
function redraw(stats, concurrency, tuneResults=[]) {
    const frame = renderDashboard(stats, concurrency, tuneResults);
    const frameLines = frame.split('\n');
    if (lastLineCount>0) process.stdout.write(`\x1b[${lastLineCount}A`);
    process.stdout.write(frameLines.map(l=>'\x1b[2K'+l).join('\n'));
    lastLineCount = frameLines.length;
}

// ── Single run ────────────────────────────────────────────────────────────────
async function runOnce(scenarios, concurrency, durationMs, tuneResults=[]) {
    const stats      = new Stats();
    const stopSignal = { stop: false };

    const snapInterval = setInterval(()=>stats.snapRps(), 1000);
    const dashInterval = setInterval(()=>redraw(stats, concurrency, tuneResults), 250);

    // staggered ramp
    const ramp = Math.min(RAMP_MS, durationMs * 0.2);
    const workerPromises = [];
    for (let i=0; i<concurrency; i++) {
        const delay = (ramp/concurrency)*i;
        workerPromises.push(new Promise(r=>setTimeout(r,delay)).then(()=>worker(scenarios,stats,stopSignal)));
    }

    await new Promise(r=>setTimeout(r, durationMs));
    stopSignal.stop = true;
    await Promise.all(workerPromises);
    clearInterval(snapInterval);
    clearInterval(dashInterval);

    redraw(stats, concurrency, tuneResults);
    return stats;
}

// ── Tune mode ─────────────────────────────────────────────────────────────────
async function tuneMode(token, productIds) {
    const scenarios  = buildScenarios(token, productIds);
    const tuneResults = [];
    const levels = [];
    for (let c=TUNE_STEP; c<=TUNE_MAX; c+=TUNE_STEP) levels.push(c);

    console.log(bold(cyan(`\n🔬 Auto-tune: testing ${levels.length} levels [${levels[0]}→${levels[levels.length-1]}] ${TUNE_DURATION/1000}s each\n`)));
    await new Promise(r=>setTimeout(r,600));

    process.stdout.write(A.hideCursor);

    for (const concurrency of levels) {
        // brief cooldown between runs
        if (tuneResults.length > 0) {
            process.stdout.write(`\x1b[${lastLineCount}A`);
            console.log(dim(`\n  Cooldown 3s before concurrency=${concurrency}...`));
            await new Promise(r=>setTimeout(r,3000));
        }

        console.log(bold(cyan(`\n  ▶ Testing concurrency=${concurrency}...`)));
        await new Promise(r=>setTimeout(r,300));

        const stats = await runOnce(scenarios, concurrency, TUNE_DURATION, tuneResults);

        // collect all latencies across endpoints
        const allLat = Object.values(stats.byName).flatMap(b=>b.latencies);
        const avgLat = allLat.length ? allLat.reduce((a,v)=>a+v,0)/allLat.length : 0;
        const p95    = stats.pct(allLat, 95);
        const rps    = stats.stableRps(8);
        const errPct = stats.total ? (stats.errors/stats.total)*100 : 0;

        tuneResults.push({ concurrency, rps, avgLat, p95, errPct, total: stats.total });

        // early stop if latency explodes or errors spike > 20%
        if (errPct > 20) {
            console.log(red(`\n  ⚠ Error rate ${errPct.toFixed(1)}% > 20% — stopping tune early`));
            break;
        }
        if (p95 > 5000) {
            console.log(red(`\n  ⚠ p95 latency ${p95}ms > 5000ms — system saturated, stopping`));
            break;
        }
    }

    // final render with full results
    const dummyStats = new Stats();
    redraw(dummyStats, 0, tuneResults);
    process.stdout.write(A.showCursor);

    const peak = tuneResults.reduce((a,b)=>a.rps>b.rps?a:b);
    console.log(bold(green(`\n✅ Tune complete — Peak RPS: ${peak.rps.toFixed(1)} at concurrency=${peak.concurrency}`)));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log(bold(cyan('\n⚡ Load Test Initializing')));

    process.stdout.write('   Obtaining token...     ');
    const token = await getToken();
    console.log(green('✅ OK'));

    process.stdout.write('   Fetching product IDs... ');
    const productIds = await fetchProductIds(token);
    console.log(green(`✅ ${productIds.length} products`));

    if (TUNE_MODE) {
        await tuneMode(token, productIds);
        return;
    }

    console.log(dim(`\n   concurrency=${CONCURRENCY}  duration=${DURATION_MS/1000}s${MAX_REQUESTS?'  maxReqs='+MAX_REQUESTS:''}`));
    console.log(dim(`   Ramping up ${CONCURRENCY} workers over ${RAMP_MS/1000}s...`));
    await new Promise(r=>setTimeout(r,800));

    const scenarios  = buildScenarios(token, productIds);
    process.on('SIGINT', ()=>{ process.stdout.write(A.showCursor); process.exit(0); });
    process.stdout.write(A.hideCursor);

    const stats = await runOnce(scenarios, CONCURRENCY, MAX_REQUESTS ? Infinity : DURATION_MS);
    process.stdout.write(A.showCursor);

    const e = stats.elapsed().toFixed(1);
    console.log(bold(green(`\n✅ Complete — ${stats.total} requests in ${e}s  (${stats.currentRps()} rps)  errors: ${stats.errors}`)));
}

main().catch(err => {
    process.stdout.write(A.showCursor);
    console.error(red('\n❌ Fatal: '+err.message));
    process.exit(1);
});