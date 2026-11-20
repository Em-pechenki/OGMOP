import { create } from "zustand";
import {
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/system";
import type { NodeData } from "@shared/types";

export type RFNode = Node<NodeData>;
export type RFEdge = Edge;

export interface WorkflowState {
  nodes: RFNode[];
  edges: RFEdge[];
  selectedNodeId: string | null;
  selectedNode: RFNode | null;
  setNodes: (nodes: RFNode[]) => void;
  setEdges: (edges: RFEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (node: RFNode) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  reset: () => void;
}

const findSelected = (nodes: RFNode[], id: string | null): RFNode | null =>
  id ? nodes.find((n) => n.id === id) ?? null : null;

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNode: null,
  setNodes: (nodes) =>
    set((state) => ({
      nodes,
      selectedNode: findSelected(nodes, state.selectedNodeId),
    })),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(get().nodes, changes) as RFNode[];
    set({ nodes, selectedNode: findSelected(nodes, get().selectedNodeId) });
  },
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(get().edges, changes) as RFEdge[] }),
  onConnect: (connection) => set({ edges: addEdge(connection, get().edges) as RFEdge[] }),
  setSelectedNodeId: (id) =>
    set((state) => ({ selectedNodeId: id, selectedNode: findSelected(state.nodes, id) })),
  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  removeNode: (id) => {
    const selectedNodeId = get().selectedNodeId === id ? null : get().selectedNodeId;
    const nodes = get().nodes.filter((n) => n.id !== id);
    set({
      nodes,
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId,
      selectedNode: findSelected(nodes, selectedNodeId),
    });
  },
  updateNodeData: (id, data) => {
    const nodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } as NodeData } : n
    );
    set({ nodes, selectedNode: findSelected(nodes, get().selectedNodeId) });
  },
  reset: () => set({ nodes: [], edges: [], selectedNodeId: null, selectedNode: null }),
}));
