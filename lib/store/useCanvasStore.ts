import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import { AVAILABLE_COMPONENTS } from "@/lib/tasks/taskRegistry";

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  simulationResult: any | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection | Edge) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setSimulationResult: (result: any) => void;
  updateNodeValue: (nodeId: string, value: any) => void;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  simulationResult: null,
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge({ ...connection, type: "wire", animated: true }, state.edges),
    })),
  addNode: (type, position) =>
    set((state) => {
      const typeCount = state.nodes.filter((n) => n.data.componentType === type).length + 1;
      let shortType = type.charAt(0).toUpperCase();
      if (type === "voltagesource") shortType = "V";
      if (type === "voltageprobe") shortType = "VP";

      const name = `${shortType}${typeCount}`;
      const meta = AVAILABLE_COMPONENTS[type];
      
      const componentIcon = meta ? meta.icon : "?";

      // provide a default value hint where needed
      let defaultValue = "set value";
      if (type === "voltageprobe") defaultValue = "";
      if (type === "diode" || type === "ground") defaultValue = ""; // no value needed

      return {
        nodes: [
          ...state.nodes,
          {
            id: `${type}-${Date.now()}`,
            type: "circuit",
            position,
            data: {
              componentType: type,
              name,
              value: defaultValue,
              icon: componentIcon,
            },
          },
        ],
      };
    }),
  updateNodeValue: (nodeId, value) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === nodeId ? { ...node, data: { ...node.data, value } } : node
      )
    }));
  },
  setSimulationResult: (result) => set({ simulationResult: result }),
  resetCanvas: () => set({ nodes: [], edges: [], simulationResult: null }),
}));
