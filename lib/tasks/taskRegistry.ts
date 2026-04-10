import { Node, Edge } from "@xyflow/react";

export interface ValidationResult {
  passed: boolean;
  score: number;          // 0–100
  feedback: string;       // Shown to user
  wrongParts?: string[];  // e.g. ["R1 value too high", "missing diode"]
}

export interface SimulationResult {
  probeData: Record<string, { time: number; voltage: number }[]>;
  netlist: any; // Circuit JSON
}

export interface TaskDefinition {
  slug: string;                        // URL slug: "half-wave-rectifier"
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  badgeId: string;

  theory: {
    summary: string;                   // 2–3 sentences shown in the theory card
    keyFormulas: { label: string; formula: string }[];
    externalLink?: string;
  };

  allowedComponents: string[];         // Components shown in the palette for this task

  preWiredNodes?: Node[];              // Optional: pre-place some nodes as hints
  preWiredEdges?: Edge[];

  goal: string;                        // Human-readable goal shown at top of task
  hints: string[];                     // Revealed progressively on wrong attempts

  validate: (nodes: Node[], edges: Edge[], simResult: SimulationResult) => ValidationResult;
}

export const AVAILABLE_COMPONENTS: Record<string, { label: string; icon: string }> = {
  resistor: { label: "Resistor", icon: "⚡" },
  capacitor: { label: "Capacitor", icon: "⏸" },
  diode: { label: "Diode", icon: "▶| " },
  voltagesource: { label: "AC Source", icon: "∿" },
  voltageprobe: { label: "Probe", icon: "📍" },
  ground: { label: "Ground", icon: "⏚" },
  chip: { label: "IC / Chip", icon: "⬛" },
  led: { label: "LED", icon: "💡" },
};

import { halfWaveRectifier } from "./halfWaveRectifier";

export const taskRegistry: Record<string, TaskDefinition> = {
  [halfWaveRectifier.slug]: halfWaveRectifier,
};
