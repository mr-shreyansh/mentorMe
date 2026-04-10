@AGENTS.md
# CLAUDE.md — Electronics Learning Platform

> **This document is the single source of truth for building an interactive electronics learning platform inside a Next.js app. Read every section before writing any code. Follow the task sequencing rules strictly.**

---

## 0. Project Overview

You are building a **gamified electronics learning platform** embedded inside a Next.js 14+ (App Router) application. Users complete interactive circuit-building tasks to learn core electronics concepts taught at the undergraduate level.

The platform has two major technical pillars:
1. **Visual circuit canvas** — drag-and-drop using `@xyflow/react` (React Flow v12)
2. **Circuit simulation and schematic rendering** — using `tscircuit` + `@tscircuit/core`

Users **never write code**. They drag components onto a canvas, connect pins, set values, and hit "Simulate". The platform validates their circuit, runs SPICE simulation, renders the schematic, and awards XP/badges.

---

## 1. Task Sequencing Rules (CRITICAL — Read First)

**You must implement tasks one at a time.** The order is:

1. **Half-Wave Rectifier** ← Start here. Build, test, and await approval.
2. Full-Wave Bridge Rectifier
3. Zener Voltage Regulation
4. BJT Switch
5. Decoupling Capacitors
6. Op-Amp Basics (Inverting + Non-Inverting)

**Rules:**
- Implement Task 1 fully (canvas, simulation, validation, gamification).
- Stop. Output: "Task 1 complete. Review and confirm before I proceed to Task 2."
- Only proceed to the next task when explicitly told: "looks good, do the next one" or similar confirmation.
- Every task shares the same layout shell, canvas engine, and gamification system — build those as shared infrastructure during Task 1 and reuse them for all subsequent tasks.
- Do not stub or scaffold future tasks. Write no placeholder code for tasks 2–6 until told to.

---

## 2. Tech Stack

### Core
| Concern | Package | Notes |
|---------|---------|-------|
| Framework | `next` 14+ App Router | Use `"use client"` for all canvas/circuit components |
| Circuit canvas | `@xyflow/react` | Drag-and-drop, node/edge graph |
| Circuit rendering | `tscircuit`, `@tscircuit/core` | Schematic + PCB render |
| Schematic viewer | `@tscircuit/schematic-viewer` | Read-only schematic preview |
| SPICE simulation | `@tscircuit/core` with `analogsimulation` | ngspice-based, browser WASM |
| Styling | Tailwind CSS | Already configured in Next.js |

### Supporting Libraries
| Concern | Package | Notes |
|---------|---------|-------|
| State management | `zustand` | Per-task canvas state, XP, badges |
| Code eval (internal) | `@tscircuit/eval` | Convert canvas state → Circuit JSON |
| Waveform display | `recharts` or `react-chartjs-2` | Display SPICE simulation output graphs |
| Toast notifications | `sonner` | "Correct!", "Wrong value!", badge unlocks |
| Confetti | `canvas-confetti` | On task completion |
| Tooltip/popover | `@radix-ui/react-tooltip` | Component info cards on hover |
| Modal | `@radix-ui/react-dialog` | Theory card overlays |
| Component value input | `@radix-ui/react-popover` | Click a node to edit resistance/voltage |
| Icons | `lucide-react` | UI icons |

### Dev / Validation
| Concern | Package |
|---------|---------|
| Type safety | TypeScript strict mode |
| Circuit JSON parsing | `circuit-json` npm package |
| Unit testing | `vitest` |

---

## 3. Architecture

```
app/
├── learn/
│   ├── layout.tsx               ← Shared learn shell (sidebar, XP bar, navbar)
│   └── [taskSlug]/
│       └── page.tsx             ← Dynamic task page
│
components/
├── canvas/
│   ├── CircuitCanvas.tsx        ← Main XYFlow canvas wrapper
│   ├── ComponentPalette.tsx     ← Draggable component sidebar
│   ├── CircuitNode.tsx          ← Custom XYFlow node for each component
│   ├── WireEdge.tsx             ← Custom XYFlow edge for circuit wires
│   └── CanvasToolbar.tsx        ← Reset, Simulate, Hint buttons
│
├── simulation/
│   ├── SchematicPreview.tsx     ← tscircuit schematic viewer (read-only)
│   ├── WaveformChart.tsx        ← recharts waveform display
│   └── circuitBuilder.ts       ← Canvas state → tscircuit JSX string builder
│
├── gamification/
│   ├── XPBar.tsx
│   ├── BadgeUnlock.tsx
│   └── TaskCompleteBanner.tsx
│
├── tasks/
│   ├── TaskShell.tsx            ← Layout: theory | canvas | output panels
│   ├── TheoryCard.tsx           ← Collapsible theory section per task
│   └── ValidationFeedback.tsx  ← Error/success messages
│
lib/
├── tasks/
│   ├── taskRegistry.ts          ← All task definitions live here
│   ├── halfWaveRectifier.ts     ← Task 1 definition
│   └── ...                     ← Add one file per task, only when approved
│
├── validation/
│   └── validateCircuit.ts       ← Circuit JSON validation logic
│
└── store/
    ├── useCanvasStore.ts        ← Zustand: nodes, edges, simulation results
    └── usePlayerStore.ts        ← Zustand: XP, badges, completed tasks
```

---

## 4. tscircuit Integration

### 4a. Installation
```bash
npm install tscircuit @tscircuit/core @tscircuit/schematic-viewer circuit-json
```

### 4b. CRITICAL: Next.js Compatibility
tscircuit uses browser APIs. Always do the following:

```tsx
// In any page/component that uses tscircuit
"use client";

// Dynamic import with SSR disabled — required for all tscircuit components
import dynamic from "next/dynamic";

const SchematicPreview = dynamic(
  () => import("@/components/simulation/SchematicPreview"),
  { ssr: false }
);
```

In `next.config.ts`, add:
```ts
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};
```

### 4c. How the Canvas → tscircuit Pipeline Works

The user never writes tscircuit code. The canvas state is a graph of nodes and edges. You convert this to tscircuit JSX programmatically:

```ts
// lib/simulation/circuitBuilder.ts

import type { Node, Edge } from "@xyflow/react";

export function buildTscircuitJSX(nodes: Node[], edges: Edge[]): string {
  const componentLines = nodes.map((node) => {
    const { componentType, value, name } = node.data;
    switch (componentType) {
      case "resistor":
        return `<resistor name="${name}" resistance="${value}" />`;
      case "capacitor":
        return `<capacitor name="${name}" capacitance="${value}" />`;
      case "diode":
        return `<diode name="${name}" />`;
      case "voltagesource":
        return `<voltagesource name="${name}" voltage="${value.dc}" frequency="${value.freq}" waveShape="${value.shape}" />`;
      case "voltageprobe":
        return `<voltageprobe name="${name}" connectsTo=".${value.connectsTo}" />`;
      case "ground":
        return `<ground name="${name}" />`;
      // Add more as needed
    }
  });

  const traceLines = edges.map((edge) => {
    // edge.sourceHandle and edge.targetHandle encode pin names
    // e.g. sourceHandle: "R1.left", targetHandle: "D1.anode"
    return `<trace from=".${edge.sourceHandle}" to=".${edge.targetHandle}" />`;
  });

  return `
    <board schMaxTraceDistance={10} routingDisabled>
      ${componentLines.join("\n      ")}
      ${traceLines.join("\n      ")}
      <analogsimulation duration="50ms" timePerStep="0.1ms" spiceEngine="ngspice" />
    </board>
  `;
}
```

### 4d. Rendering the Schematic

```tsx
// components/simulation/SchematicPreview.tsx
"use client";
import { Circuit } from "tscircuit";
import { SchematicViewer } from "@tscircuit/schematic-viewer";

interface Props {
  jsxString: string;
}

export default function SchematicPreview({ jsxString }: Props) {
  // Evaluate the JSX string to a React element
  // Use @tscircuit/eval or a sandboxed eval
  const CircuitComponent = buildComponentFromString(jsxString); // see eval section

  return (
    <Circuit>
      <SchematicViewer>
        <CircuitComponent />
      </SchematicViewer>
    </Circuit>
  );
}
```

### 4e. Running SPICE Simulation

After the user hits "Simulate":
1. Build the tscircuit JSX string from canvas state.
2. Evaluate it with `@tscircuit/eval`.
3. Pass the resulting Circuit JSON to the simulation engine.
4. Extract voltage probe data and render with `recharts`.

```tsx
import { evalCompiledJs } from "@tscircuit/eval";

async function runSimulation(jsxString: string) {
  const circuitJson = await evalCompiledJs(jsxString);
  // circuitJson contains simulation results including probe waveforms
  return circuitJson;
}
```

### 4f. Supported tscircuit Components

These are the components available for use across all tasks:

| Tag | Props |
|-----|-------|
| `<resistor>` | `name`, `resistance` (e.g. `"1kohm"`, `"640ohm"`) |
| `<capacitor>` | `name`, `capacitance` (e.g. `"100uF"`) |
| `<diode>` | `name`, `model` (optional) |
| `<voltagesource>` | `name`, `voltage`, `frequency`, `waveShape` (`"sinewave"` / `"dc"`) |
| `<voltageprobe>` | `name`, `connectsTo` (e.g. `".R1 > .pin1"`) |
| `<ground>` | `name` |
| `<chip>` | `name`, `port_arrangement`, `port_labels` (for BJT/op-amp) |
| `<analogsimulation>` | `duration`, `timePerStep`, `spiceEngine` |
| `<board>` | `width`, `height`, `schMaxTraceDistance`, `routingDisabled` |

---

## 5. @xyflow/react (React Flow) Integration

### 5a. Installation
```bash
npm install @xyflow/react
```

### 5b. Canvas Setup

```tsx
// components/canvas/CircuitCanvas.tsx
"use client";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/lib/store/useCanvasStore";
import CircuitNode from "./CircuitNode";
import WireEdge from "./WireEdge";

const nodeTypes = { circuit: CircuitNode };
const edgeTypes = { wire: WireEdge };

export default function CircuitCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useCanvasStore();

  return (
    <div className="w-full h-full rounded-xl border border-zinc-800 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        connectionLineStyle={{ stroke: "#22d3ee", strokeWidth: 2 }}
        defaultEdgeOptions={{ type: "wire", animated: true }}
      >
        <Background color="#1e293b" gap={16} />
        <Controls />
        <MiniMap nodeColor="#334155" maskColor="rgba(0,0,0,0.7)" />
      </ReactFlow>
    </div>
  );
}
```

### 5c. Custom Circuit Node

Each component on the canvas is a custom node. It renders an icon, the component name, and editable value. Pins are exposed as `Handle` elements.

```tsx
// components/canvas/CircuitNode.tsx
"use client";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";

export default function CircuitNode({ data, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`relative bg-zinc-800 border rounded-lg p-3 min-w-[100px] cursor-pointer
        ${selected ? "border-cyan-400 shadow-cyan-400/20 shadow-lg" : "border-zinc-600"}`}
    >
      {/* Left pin */}
      <Handle type="target" position={Position.Left} id={`${data.name}.left`} />

      {/* Component body */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">{data.icon}</span>
        <span className="text-xs text-zinc-300 font-mono">{data.name}</span>
        <span
          className="text-xs text-cyan-400 cursor-pointer hover:underline"
          onClick={() => setEditing(true)}
        >
          {data.value || "set value"}
        </span>
      </div>

      {/* Right pin */}
      <Handle type="source" position={Position.Right} id={`${data.name}.right`} />

      {/* Value edit popover — use Radix Popover here */}
      {editing && (
        <ValueEditor
          value={data.value}
          onSave={(v) => { data.onValueChange(v); setEditing(false); }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
```

### 5d. Component Palette (Drag-to-Canvas)

```tsx
// components/canvas/ComponentPalette.tsx
"use client";
import { useCanvasStore } from "@/lib/store/useCanvasStore";
import { AVAILABLE_COMPONENTS } from "@/lib/tasks/taskRegistry";

export default function ComponentPalette({ allowedComponents }: { allowedComponents: string[] }) {
  const { addNode } = useCanvasStore();

  const onDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
  };

  const onDrop = (e: React.DragEvent) => {
    const componentType = e.dataTransfer.getData("componentType");
    const position = { x: e.clientX - 200, y: e.clientY - 80 };
    addNode(componentType, position);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-900 border-r border-zinc-800 w-48">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Components</p>
      {allowedComponents.map((type) => {
        const meta = AVAILABLE_COMPONENTS[type];
        return (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-2 p-2 rounded-md bg-zinc-800 hover:bg-zinc-700
                       cursor-grab text-sm text-zinc-200 select-none"
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
```

### 5e. Zustand Canvas Store

```ts
// lib/store/useCanvasStore.ts
import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import type { Node, Edge, Connection, NodeChange, EdgeChange } from "@xyflow/react";

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  simulationResult: any | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  setSimulationResult: (result: any) => void;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  simulationResult: null,
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) =>
    set((state) => ({ edges: addEdge({ ...connection, type: "wire", animated: true }, state.edges) })),
  addNode: (type, position) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: `${type}-${Date.now()}`,
          type: "circuit",
          position,
          data: {
            componentType: type,
            name: `${type.charAt(0).toUpperCase()}${state.nodes.filter(n => n.data.componentType === type).length + 1}`,
            value: "",
            icon: COMPONENT_ICONS[type],
          },
        },
      ],
    })),
  setSimulationResult: (result) => set({ simulationResult: result }),
  resetCanvas: () => set({ nodes: [], edges: [], simulationResult: null }),
}));
```

---

## 6. Task Definition Schema

Every task is defined as a TypeScript object conforming to this schema:

```ts
// lib/tasks/taskRegistry.ts

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
  // ↑ This is the core task logic. See Section 7.
}

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
```

---

## 7. Task Definitions

### Task 1: Half-Wave Rectifier

```ts
// lib/tasks/halfWaveRectifier.ts
import type { TaskDefinition } from "./taskRegistry";

export const halfWaveRectifier: TaskDefinition = {
  slug: "half-wave-rectifier",
  title: "Half-Wave Rectifier",
  description: "Build a circuit that converts AC to pulsed DC using a single diode.",
  difficulty: "beginner",
  xpReward: 100,
  badgeId: "rectifier-apprentice",

  theory: {
    summary:
      "A half-wave rectifier uses a single diode to allow only the positive half of an AC sine wave to pass through. The negative half is blocked. The output is a pulsed DC signal.",
    keyFormulas: [
      { label: "Peak output voltage", formula: "V_out = V_in(peak) − V_diode_drop" },
      { label: "Average DC output", formula: "V_avg = V_peak / π ≈ 0.318 × V_peak" },
    ],
  },

  allowedComponents: ["voltagesource", "diode", "resistor", "ground", "voltageprobe"],

  goal: "Connect an AC voltage source → diode → resistor → ground. Place voltage probes at the input and output to observe rectification.",

  hints: [
    "Start with: AC source → Diode (anode in, cathode out) → Resistor → Ground",
    "The diode anode connects to the positive terminal of the source.",
    "Place a voltageprobe on both sides of the diode to compare waveforms.",
  ],

  validate(nodes, edges, simResult) {
    const hasVoltageSource = nodes.some((n) => n.data.componentType === "voltagesource");
    const hasDiode = nodes.some((n) => n.data.componentType === "diode");
    const hasResistor = nodes.some((n) => n.data.componentType === "resistor");
    const hasGround = nodes.some((n) => n.data.componentType === "ground");

    if (!hasVoltageSource || !hasDiode || !hasResistor || !hasGround) {
      return {
        passed: false,
        score: 0,
        feedback: "Missing components. You need: voltage source, diode, resistor, and ground.",
      };
    }

    // Check simulation: output probe should show only positive half cycles
    const outputProbe = simResult.probeData["VP_OUT"];
    if (!outputProbe) {
      return { passed: false, score: 30, feedback: "Add a voltageprobe at the output (after the diode)." };
    }

    const hasNegativeOutput = outputProbe.some((p) => p.voltage < -0.1);
    if (hasNegativeOutput) {
      return {
        passed: false,
        score: 50,
        feedback: "The output has negative voltages — check your diode orientation.",
      };
    }

    return {
      passed: true,
      score: 100,
      feedback: "✅ Correct! Your rectifier is working. Notice how only positive half-cycles appear at the output.",
    };
  },
};
```

**After Task 1 is approved, add the following tasks following the exact same pattern:**

---

### Task 2: Full-Wave Bridge Rectifier (ADD AFTER APPROVAL)

```ts
// Skeleton — implement fully only after Task 1 approval

export const fullWaveRectifier: TaskDefinition = {
  slug: "full-wave-rectifier",
  title: "Full-Wave Bridge Rectifier",
  difficulty: "beginner",
  xpReward: 150,
  badgeId: "bridge-builder",
  allowedComponents: ["voltagesource", "diode", "resistor", "ground", "voltageprobe"],
  // Uses 4 diodes in bridge configuration
  // Validate: output should always be positive for both half cycles
  // Key check: sim output shows no negative voltages, ripple is double frequency of input
  validate: () => ({ passed: false, score: 0, feedback: "" }), // stub until approved
};
```

---

### Task 3: Zener Voltage Regulation (ADD AFTER APPROVAL)

```ts
export const zenerRegulation: TaskDefinition = {
  slug: "zener-regulation",
  title: "Zener Voltage Regulator",
  difficulty: "intermediate",
  xpReward: 175,
  badgeId: "voltage-stabilizer",
  allowedComponents: ["voltagesource", "diode", "resistor", "ground", "voltageprobe"],
  // Use a Zener diode in reverse breakdown
  // Validate: output voltage is clamped to zener voltage regardless of input variation
  // Key check: VP_OUT stays within ±5% of zener voltage across varying input
  validate: () => ({ passed: false, score: 0, feedback: "" }),
};
```

---

### Task 4: BJT Switch (ADD AFTER APPROVAL)

```ts
export const bjtSwitch: TaskDefinition = {
  slug: "bjt-switch",
  title: "BJT as a Switch",
  difficulty: "intermediate",
  xpReward: 200,
  badgeId: "transistor-logic",
  allowedComponents: ["voltagesource", "chip", "resistor", "led", "ground", "voltageprobe"],
  // chip represents BJT (NPN: base, collector, emitter)
  // Validate: small base current switches larger collector current (LED on/off)
  // Key check: collector current responds to base input signal
  validate: () => ({ passed: false, score: 0, feedback: "" }),
};
```

---

### Task 5: Decoupling Capacitors (ADD AFTER APPROVAL)

```ts
export const decouplingCaps: TaskDefinition = {
  slug: "decoupling-capacitors",
  title: "Decoupling Capacitors",
  difficulty: "intermediate",
  xpReward: 175,
  badgeId: "noise-canceler",
  allowedComponents: ["voltagesource", "capacitor", "resistor", "chip", "ground", "voltageprobe"],
  // Place capacitor between VCC and GND close to chip
  // Validate: with cap, output noise is reduced vs without cap (compare probes)
  // Key check: VP_OUT_FILTERED has lower peak-to-peak ripple than VP_OUT_RAW
  validate: () => ({ passed: false, score: 0, feedback: "" }),
};
```

---

### Task 6: Op-Amp Basics (ADD AFTER APPROVAL)

```ts
export const opAmpBasics: TaskDefinition = {
  slug: "op-amp-basics",
  title: "Op-Amp: Inverting Amplifier",
  difficulty: "advanced",
  xpReward: 250,
  badgeId: "signal-amplifier",
  allowedComponents: ["voltagesource", "chip", "resistor", "ground", "voltageprobe"],
  // chip = op-amp (741 or LM358), pins: +IN, -IN, OUT, VCC, GND
  // Validate: gain = -Rf/Rin, output is inverted and amplified
  // Key check: |V_out / V_in| ≈ Rf / Rin within 10% tolerance
  validate: () => ({ passed: false, score: 0, feedback: "" }),
};
```

---

## 8. Validation Logic Guidelines

Each `validate()` function should check in this order:

1. **Topology check** — Are the required component types present?
2. **Connection check** — Are critical nodes connected? (Use edge source/target handles)
3. **Value check** — Are component values within acceptable ranges?
4. **Simulation check** — Does the waveform output match expected behavior?

```ts
// lib/validation/validateCircuit.ts

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
```

---

## 9. Gamification System

### XP and Levels

```ts
// lib/store/usePlayerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  xp: number;
  level: number;
  badges: string[];
  completedTasks: string[];
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  completeTask: (slug: string) => void;
}

const XP_PER_LEVEL = 500;

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      badges: [],
      completedTasks: [],
      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
        set({ xp: newXP, level: newLevel });
      },
      unlockBadge: (badgeId) => {
        if (!get().badges.includes(badgeId)) {
          set((state) => ({ badges: [...state.badges, badgeId] }));
        }
      },
      completeTask: (slug) => {
        if (!get().completedTasks.includes(slug)) {
          set((state) => ({ completedTasks: [...state.completedTasks, slug] }));
        }
      },
    }),
    { name: "player-store" }
  )
);
```

### XP Scoring

| Condition | XP Multiplier |
|-----------|--------------|
| Correct on first attempt | 100% of task XP |
| Correct on second attempt | 75% |
| Correct on third attempt | 50% |
| Correct after hints used | 25% |
| Task already completed (redo) | 10 XP flat |

### Badges

| Badge ID | Name | Task | Unlock Condition |
|----------|------|------|-----------------|
| `rectifier-apprentice` | Rectifier Apprentice | Half-Wave | Pass on first attempt |
| `bridge-builder` | Bridge Builder | Full-Wave | Pass with correct 4-diode topology |
| `voltage-stabilizer` | Voltage Stabilizer | Zener | Output within 5% of zener voltage |
| `transistor-logic` | Transistor Logic | BJT | Pass with correct base/collector wiring |
| `noise-canceler` | Noise Canceler | Decoupling | Measurable noise reduction shown in sim |
| `signal-amplifier` | Signal Amplifier | Op-Amp | Gain within 10% of target |
| `circuit-master` | Circuit Master | All tasks | Complete all 6 tasks |

### On Task Completion

```tsx
// Trigger this sequence when validate() returns passed: true
import confetti from "canvas-confetti";
import { toast } from "sonner";

function handleTaskComplete(result: ValidationResult, task: TaskDefinition) {
  const { addXP, unlockBadge, completeTask } = usePlayerStore.getState();
  const xpEarned = Math.round(task.xpReward * (result.score / 100));

  addXP(xpEarned);
  completeTask(task.slug);
  unlockBadge(task.badgeId);

  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

  toast.success(`+${xpEarned} XP — ${task.title} Complete!`, {
    description: result.feedback,
    duration: 5000,
  });
}
```

---

## 10. Task Page Layout

Each task page (`app/learn/[taskSlug]/page.tsx`) uses a 3-panel layout:

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR: Task title | XP bar | Level badge               │
├────────────┬────────────────────────┬────────────────────┤
│            │                        │                    │
│ Component  │   Circuit Canvas       │  Output Panel      │
│ Palette    │   (@xyflow/react)      │                    │
│            │                        │  [Theory Card]     │
│ [drag]     │   [nodes + edges]      │  [Schematic View]  │
│            │                        │  [Waveform Chart]  │
│            │                        │  [Validate Btn]    │
│            │                        │  [Feedback]        │
│            │                        │  [Hints]           │
└────────────┴────────────────────────┴────────────────────┘
```

```tsx
// components/tasks/TaskShell.tsx
"use client";
import ComponentPalette from "@/components/canvas/ComponentPalette";
import CircuitCanvas from "@/components/canvas/CircuitCanvas";
import TheoryCard from "./TheoryCard";
import ValidationFeedback from "./ValidationFeedback";
import CanvasToolbar from "@/components/canvas/CanvasToolbar";
import dynamic from "next/dynamic";

const SchematicPreview = dynamic(() => import("@/components/simulation/SchematicPreview"), { ssr: false });
const WaveformChart = dynamic(() => import("@/components/simulation/WaveformChart"), { ssr: false });

export default function TaskShell({ task }: { task: TaskDefinition }) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Left: Palette */}
      <ComponentPalette allowedComponents={task.allowedComponents} />

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col">
        <CanvasToolbar task={task} />
        <CircuitCanvas />
      </div>

      {/* Right: Output */}
      <div className="w-80 flex flex-col gap-4 p-4 bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
        <TheoryCard theory={task.theory} goal={task.goal} />
        <SchematicPreview />
        <WaveformChart />
        <ValidationFeedback task={task} />
      </div>
    </div>
  );
}
```

---

## 11. Routing

```ts
// app/learn/[taskSlug]/page.tsx
import { taskRegistry } from "@/lib/tasks/taskRegistry";
import TaskShell from "@/components/tasks/TaskShell";
import { notFound } from "next/navigation";

export default function TaskPage({ params }: { params: { taskSlug: string } }) {
  const task = taskRegistry[params.taskSlug];
  if (!task) return notFound();
  return <TaskShell task={task} />;
}

export function generateStaticParams() {
  return Object.keys(taskRegistry).map((slug) => ({ taskSlug: slug }));
}
```

```ts
// lib/tasks/taskRegistry.ts
import { halfWaveRectifier } from "./halfWaveRectifier";
// Import others only after approval

export const taskRegistry: Record<string, TaskDefinition> = {
  [halfWaveRectifier.slug]: halfWaveRectifier,
  // Add others here sequentially
};
```

---

## 12. Implementation Checklist — Task 1

Complete these in order before moving to Task 2:

- [ ] Install all packages from Section 2
- [ ] Configure `next.config.ts` for tscircuit (Section 4b)
- [ ] Create `useCanvasStore` and `usePlayerStore`
- [ ] Build `CircuitNode` with handles for all component types
- [ ] Build `ComponentPalette` with drag-to-canvas
- [ ] Build `WireEdge` custom edge component
- [ ] Build `circuitBuilder.ts` canvas → tscircuit JSX conversion
- [ ] Build `SchematicPreview` with dynamic import + SSR disabled
- [ ] Build `WaveformChart` from probe simulation data
- [ ] Implement `halfWaveRectifier` task definition with full `validate()`
- [ ] Build `TaskShell` 3-panel layout
- [ ] Implement gamification: XP, badges, confetti on success
- [ ] Wire up `app/learn/half-wave-rectifier/page.tsx`
- [ ] Test: drag diode + resistor + source + ground → connect → simulate → check waveform → validate
- [ ] **Output: "Task 1 complete. Review and confirm before I proceed to Task 2."**

---

## 13. Common Pitfalls and Rules

1. **Never use SSR for tscircuit components.** Always `dynamic(..., { ssr: false })`.
2. **Never allow users to write JSX.** All circuit code is generated from canvas state.
3. **Always reset canvas state between tasks.** Call `useCanvasStore.getState().resetCanvas()` on route change.
4. **Pin handles must be unique per node.** Use format `"ComponentName.pinName"` (e.g., `"D1.anode"`, `"R1.left"`).
5. **tscircuit traces use dot-notation.** `.D1 > .anode` not `D1.anode` in the JSX string.
6. **Store persists between sessions.** `usePlayerStore` uses `persist` middleware — XP and badges survive page reload.
7. **Validate topology before running simulation.** Avoid sending invalid circuits to the SPICE engine.
8. **Hints are revealed progressively.** Show `hints[attemptCount - 1]` after each failed attempt, not all at once.
9. **All units in tscircuit use string format.** `"1kohm"`, `"100uF"`, `"5V"` — not raw numbers.
10. **Do not implement Task 2–6 until explicitly approved.** Follow the sequencing rules in Section 1.

---

## 14. File Creation Order (Task 1)

Create files in this exact order to avoid import errors:

1. `lib/store/usePlayerStore.ts`
2. `lib/store/useCanvasStore.ts`
3. `lib/tasks/taskRegistry.ts` (interfaces only)
4. `lib/tasks/halfWaveRectifier.ts`
5. `lib/validation/validateCircuit.ts`
6. `lib/simulation/circuitBuilder.ts`
7. `components/canvas/WireEdge.tsx`
8. `components/canvas/CircuitNode.tsx`
9. `components/canvas/ComponentPalette.tsx`
10. `components/canvas/CanvasToolbar.tsx`
11. `components/canvas/CircuitCanvas.tsx`
12. `components/simulation/SchematicPreview.tsx`
13. `components/simulation/WaveformChart.tsx`
14. `components/tasks/TheoryCard.tsx`
15. `components/tasks/ValidationFeedback.tsx`
16. `components/gamification/XPBar.tsx`
17. `components/gamification/BadgeUnlock.tsx`
18. `components/tasks/TaskShell.tsx`
19. `app/learn/layout.tsx`
20. `app/learn/[taskSlug]/page.tsx`

---

*End of CLAUDE.md. Begin with Task 1: Half-Wave Rectifier. Do not proceed to Task 2 without explicit user approval.*