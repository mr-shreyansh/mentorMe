import type { Node, Edge } from "@xyflow/react";

// Maps user-facing component types to the correct tscircuit JSX element names and pin names.
// "ground" is not a real tscircuit element — it maps to <net name="GND" />.
const PIN_MAP: Record<string, { left: string; right: string }> = {
  resistor: { left: "left", right: "right" },
  capacitor: { left: "left", right: "right" },
  diode: { left: "anode", right: "cathode" },
  voltagesource: { left: "negative", right: "positive" },
  voltageprobe: { left: "input", right: "input" },
  ground: { left: "GND", right: "GND" },
};

// Resolve the actual tscircuit pin name from an edge handle like "R1.left" or "D1.right"
function resolvePinName(handle: string): string | null {
  // handle format: "ComponentName.left" or "ComponentName.right"
  const parts = handle.split(".");
  if (parts.length < 2) return null;
  // Last part is direction (left/right), second-to-last is component name
  const componentName = parts[parts.length - 2];
  const direction = parts[parts.length - 1];

  // Special case: "GND" node — trace to net.GND
  if (componentName.startsWith("G")) return `net.GND`;

  return null; // Will be resolved per-edge using node lookup
}

export function buildTscircuitJSX(nodes: Node[], edges: Edge[]): string {
  // Build a lookup of node id → node data
  const nodeById: Record<string, Node> = {};
  for (const n of nodes) {
    nodeById[n.id] = n;
  }

  const groundNames = new Set<string>();
  const probeNames: string[] = [];

  const componentLines = nodes.map((node) => {
    const { componentType, name } = node.data;
    const value = String(node.data.value || "");

    switch (componentType) {
      case "resistor":
        return `<resistor name="${name}" resistance="${value || "1kohm"}" />`;
      case "capacitor":
        return `<capacitor name="${name}" capacitance="${value || "1uF"}" />`;
      case "diode":
        return `<diode name="${name}" />`;
      case "voltagesource": {
        let dc = "0V";
        let freq = "1kHz";
        let shape = "sinewave";
        try {
          if (value && value.includes("{")) {
            const parsed = JSON.parse(value);
            dc = parsed.dc || dc;
            freq = parsed.freq || freq;
            shape = parsed.shape || shape;
          } else {
            if (value) dc = value;
          }
        } catch {
          if (value) dc = value;
        }
        return `<voltagesource name="${name}" voltage="${dc}" frequency="${freq}" waveShape="${shape}" />`;
      }
      case "voltageprobe":
        // We'll wire connectsTo later once we know which edge reaches this probe
        probeNames.push(name as string);
        return null; // Handled separately after edges are resolved
      case "ground":
        groundNames.add(name as string);
        return `<net name="GND" />`; // <ground> doesn't exist; use <net>
      default:
        return "";
    }
  }).filter(Boolean);

  // Resolve edges: build trace lines and also find probe connections
  const probeConnections: Record<string, string> = {}; // probeName → connectsTo selector
  const traceLines: string[] = [];

  for (const edge of edges) {
    if (!edge.sourceHandle || !edge.targetHandle) continue;

    // sourceHandle format: "ComponentName.direction" e.g. "V1.right"
    const srcParts = edge.sourceHandle.split(".");
    const tgtParts = edge.targetHandle.split(".");
    const srcNodeId = edge.source;
    const tgtNodeId = edge.target;
    const srcNode = nodeById[srcNodeId];
    const tgtNode = nodeById[tgtNodeId];
    if (!srcNode || !tgtNode) continue;

    const srcType = String(srcNode.data.componentType);
    const tgtType = String(tgtNode.data.componentType);
    const srcName = String(srcNode.data.name);
    const tgtName = String(tgtNode.data.name);
    const srcDir = srcParts[srcParts.length - 1]; // "left" | "right"
    const tgtDir = tgtParts[tgtParts.length - 1];

    // Map "left"/"right" to real pin names
    const srcPin = PIN_MAP[srcType]?.[srcDir as "left" | "right"] ?? srcDir;
    const tgtPin = PIN_MAP[tgtType]?.[tgtDir as "left" | "right"] ?? tgtDir;

    // Ground: resolve to net.GND
    const srcSelector = srcType === "ground" ? "net.GND" : `.${srcName} > .${srcPin}`;
    const tgtSelector = tgtType === "ground" ? "net.GND" : `.${tgtName} > .${tgtPin}`;

    // For voltage probes: record what they connect to (the other end)
    if (srcType === "voltageprobe") {
      probeConnections[srcName] = tgtSelector;
    } else if (tgtType === "voltageprobe") {
      probeConnections[tgtName] = srcSelector;
    } else {
      traceLines.push(`<trace from="${srcSelector}" to="${tgtSelector}" />`);
    }
  }

  // Now build voltageprobe lines
  const probeLines = probeNames.map((name) => {
    const connectsTo = probeConnections[name];
    if (!connectsTo) {
      // Probe not connected — skip it (it will cause an error if included)
      return "";
    }
    return `<voltageprobe name="${name}" connectsTo="${connectsTo}" />`;
  }).filter(Boolean);

  const allComponents = [...componentLines, ...probeLines];

  return `
    export default () => (
      <board schMaxTraceDistance={10} routingDisabled>
        ${allComponents.join("\n        ")}
        ${traceLines.join("\n        ")}
        <analogsimulation duration="50ms" timePerStep="1ms" spiceEngine="ngspice" />
      </board>
    );
  `;
}
