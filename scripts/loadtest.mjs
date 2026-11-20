const base = "http://127.0.0.1:3001";
const N = 200;

async function hit(path) {
  const start = performance.now();
  const r = await fetch(base + path);
  const ms = performance.now() - start;
  await r.text();
  return { status: r.status, ms };
}

async function run() {
  console.log(`Load test: ${N} concurrent GET /api/health`);
  const results = await Promise.all(Array.from({ length: N }, () => hit("/api/health")));
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.status === 200).length;
  console.log(`ok=${ok}/${N} min=${times[0].toFixed(1)}ms p50=${times[Math.floor(N*0.5)].toFixed(1)}ms p95=${times[Math.floor(N*0.95)].toFixed(1)}ms max=${times[N-1].toFixed(1)}ms total=${times.reduce((a,b)=>a+b,0).toFixed(0)}ms`);

  // workflow create+run load (lighter)
  const M = 20;
  console.log(`Load test: ${M} concurrent workflow create+run`);
  const start = performance.now();
  await Promise.all(Array.from({ length: M }, async () => {
    const c = await fetch(base + "/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "load", nodes: [{ id: "n1", type: "trigger.manual", data: {} }], edges: [] }) });
    const cj = await c.json();
    const id = cj.data.id;
    const r = await fetch(base + "/api/workflows/" + id + "/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await r.text();
  }));
  console.log(`done ${M} create+run in ${(performance.now() - start).toFixed(0)}ms`);
}

run().catch((e) => { console.error(e); process.exit(1); });