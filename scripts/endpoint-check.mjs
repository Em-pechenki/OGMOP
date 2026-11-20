const base = "http://127.0.0.1:3001";
async function j(method, path, body) {
  const r = await fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch { d = t; }
  console.log(method, path, r.status, JSON.stringify(d).slice(0, 160));
  return { status: r.status, data: d };
}
(async () => {
  await j("GET", "/api/health");
  const c = await j("POST", "/api/workflows", { name: "runnable", nodes: [{ id: "n1", type: "trigger.manual", data: {} }, { id: "n2", type: "scanner.secrets", data: {} }], edges: [{ source: "n1", target: "n2" }] });
  const id = c.data.data.id;
  await j("GET", "/api/workflows");
  await j("GET", "/api/workflows/" + id);
  await j("PUT", "/api/workflows/" + id, { name: "renamed" });
  const run = await j("POST", "/api/workflows/" + id + "/run", {});
  const rid = run.data.data.runId;
  await new Promise((r) => setTimeout(r, 400));
  await j("GET", "/api/runs/" + rid);
  await j("GET", "/api/runs");
  const tpl = await j("POST", "/api/templates", { name: "tpl" });
  const tid = tpl.data.data.id;
  await j("GET", "/api/templates/" + tid);
  await j("GET", "/api/templates");
  await j("DELETE", "/api/templates/" + tid);
  await j("DELETE", "/api/workflows/" + id);
  await j("POST", "/api/workflows", { nodes: "bad" });
  await j("GET", "/api/workflows/nope");
  await j("GET", "/api/runs/nope");
  await j("POST", "/api/workflows/nope/run", {});
  console.log("DONE");
})();