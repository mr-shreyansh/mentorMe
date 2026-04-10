import { Node, Edge } from "@xyflow/react";

export function checkTopology(
  nodes: Node[],
  required: string[]
): { ok: boolean; missing: string[] } {
  const presentTypes = new Set(nodes.map((n) => n.data.componentType));
  const missing = required.filter((r) => !presentTypes.has(r));
  return { ok: missing.length === 0, missing };
}

export function checkConnection(
  edges: Edge[],
  from: string,    // e.g. "D1.cathode"
  to: string       // e.g. "R1.left"
): boolean {
  return edges.some(
    (e) =>
      (e.sourceHandle === from && e.targetHandle === to) ||
      (e.sourceHandle === to && e.targetHandle === from)
  );
}

export function checkProbeWaveform(
  probeData: { time: number; voltage: number }[],
  expectation: "positive-only" | "no-negative" | "clamped",
  clampVoltage?: number
): boolean {
  switch (expectation) {
    case "positive-only":
    case "no-negative":
      return probeData.every((p) => p.voltage >= -0.1);
    case "clamped":
      return probeData.every((p) => Math.abs(p.voltage) <= (clampVoltage! + 0.2));
    default:
      return false;
  }
}
