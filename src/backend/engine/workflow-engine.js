// Workflow engine (phase 1: topological sort + stub execution).
// Full node handlers land in phase 2.

export function topologicalSort(nodes, edges) {
  const nodeIds = (nodes || []).map((n) => n.id);
  const idSet = new Set(nodeIds);
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  const indegree = new Map(nodeIds.map((id) => [id, 0]));

  (edges || []).forEach((e) => {
    if (!idSet.has(e.source) || !idSet.has(e.target)) return;
    adjacency.get(e.source).push(e.target);
    indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
  });

  const queue = nodeIds.filter((id) => (indegree.get(id) || 0) === 0);
  const ordered = [];
  while (queue.length) {
    const id = queue.shift();
    ordered.push(id);
    for (const next of adjacency.get(id) || []) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  // Append any remaining (cycle) nodes at the end.
  for (const id of nodeIds) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered.map((id) => (nodes || []).find((n) => n.id === id));
}

function nodeHandler(node) {
  // Phase 1 stub: every node succeeds and echoes its data.
  return {
    status: "success",
    output: { nodeId: node.id, type: node.type, data: node.data || {} },
  };
}

export async function executeWorkflow(run, workflow, { onUpdate } = {}) {
  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const ordered = topologicalSort(nodes, edges);

  const nodeStatuses = {};
  const nodeResults = {};
  const context = { input: run.input || {}, nodeOutputs: {} };

  // initial queued -> running
  if (onUpdate) onUpdate({ status: "running", nodeStatuses: { ...nodeStatuses } });

  for (const node of ordered) {
    if (!node) continue;
    nodeStatuses[node.id] = "running";
    if (onUpdate) onUpdate({ nodeStatuses: { ...nodeStatuses }, currentNode: node.id });

    try {
      // small delay to simulate work and allow UI polling to observe running state
      await new Promise((r) => setTimeout(r, 50));
      const result = await nodeHandler(node);
      nodeStatuses[node.id] = result.status;
      nodeResults[node.id] = result.output;
      context.nodeOutputs[node.id] = result.output;
    } catch (err) {
      nodeStatuses[node.id] = "failed";
      nodeResults[node.id] = { error: err && err.message ? err.message : String(err) };
      // mark run failed and stop
      return {
        status: "failed",
        nodeStatuses,
        nodeResults,
        error: err && err.message ? err.message : String(err),
      };
    }
  }

  const allSuccess = Object.values(nodeStatuses).every((s) => s === "success");
  return {
    status: allSuccess ? "success" : "failed",
    nodeStatuses,
    nodeResults,
    error: null,
  };
}
