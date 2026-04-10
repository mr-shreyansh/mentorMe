# Half-Wave Rectifier: End-to-End Flow (XYFlow -> tscircuit -> Validation)

This document explains how the Half-Wave Rectifier task works across UI, state, simulation, and validation.

## 1) Runtime and Build Stack: Bun vs Turbopack vs Webpack

Short answer:
- Bun is used to execute tscircuit evaluation for simulation.
- Next.js runs the web app with next dev / next build.
- Turbopack is enabled in Next config for app bundling behavior.
- Webpack is also customized in Next config to externalize canvas.

Where this is defined:
- NPM scripts: [package.json](package.json)
- Next config (turbopack + webpack settings): [next.config.ts](next.config.ts)
- Server action that shells out to Bun: [app/actions/simulateCircuit.ts](app/actions/simulateCircuit.ts)
- Bun runner script that calls @tscircuit/eval: [scripts/tscircuit-runner.ts](scripts/tscircuit-runner.ts)

What each part does:
1. The app itself runs via Next.js scripts in package.json.
2. UI state and interactions happen in client components (XYFlow canvas + toolbar + charts).
3. When Simulate is clicked, a Server Action writes generated TSX to a temp file, then runs Bun to execute scripts/tscircuit-runner.ts.
4. The runner uses runTscircuitCode from @tscircuit/eval and prints JSON back to stdout.
5. The Server Action parses that JSON and returns it to the client.

Why Bun is currently used for simulation execution:
- The code comment in simulateCircuit.ts documents that Bun is used to avoid Node 24 ESM/package export issues in this setup.

## 2) Half-Wave Rectifier Task Definition

Task metadata and validation rules are in:
- [lib/tasks/halfWaveRectifier.ts](lib/tasks/halfWaveRectifier.ts)
- Registry and shared task schema are in [lib/tasks/taskRegistry.ts](lib/tasks/taskRegistry.ts)

What this task expects:
- Required components: voltagesource, diode, resistor, ground, voltageprobe
- Goal: AC source -> diode -> resistor -> ground, with probes for waveform observation
- Validation logic checks:
1. Required components exist
2. Output probe VP_OUT exists in simulation result
3. Output probe should not go negative (diode orientation correctness)

## 3) How XYFlow Produces a Testable State

The testable state is the graph in Zustand:
- Nodes array + Edges array + latest simulationResult
- Source: [lib/store/useCanvasStore.ts](lib/store/useCanvasStore.ts)

How nodes are created:
- Drag starts in component palette and stores componentType in dataTransfer.
- Palette: [components/canvas/ComponentPalette.tsx](components/canvas/ComponentPalette.tsx)
- Drop happens on the canvas and calls addNode(type, position).
- Canvas: [components/canvas/CircuitCanvas.tsx](components/canvas/CircuitCanvas.tsx)
- Node IDs, names (V1, VP1, etc.), and defaults are assigned by addNode in the store.

How edges are created:
- React Flow onConnect triggers store.onConnect.
- onConnect uses addEdge and stores source/target plus sourceHandle/targetHandle.
- Edge rendering is custom via [components/canvas/WireEdge.tsx](components/canvas/WireEdge.tsx)

Why this state is testable:
- It is plain structured data (nodes and edges), independent from the rendered UI.
- The validator and simulation pipeline both consume this state directly.

## 4) XYFlow -> tscircuit Conversion Layer

The graph is transformed into tscircuit JSX by:
- [lib/simulation/circuitBuilder.ts](lib/simulation/circuitBuilder.ts)

What conversion does:
1. Reads each node and emits a component tag:
   - resistor -> <resistor ...>
   - diode -> <diode ...>
   - voltagesource -> <voltagesource ...>
   - ground -> <net name="GND" />
   - voltageprobe handled after edge resolution with connectsTo
2. Reads each edge and emits traces between resolved pin selectors.
3. Adds analogsimulation settings to run SPICE.
4. Returns a full TSX module string (export default () => (<board ...>...</board>)).

Important detail:
- The builder is where UI handle IDs are mapped into tscircuit pin semantics.
- This is the critical bridge between XYFlow graph data and simulator-ready circuit representation.

## 5) What Happens When User Clicks Simulate

The click path starts here:
- [components/canvas/CanvasToolbar.tsx](components/canvas/CanvasToolbar.tsx)

Full flow:
1. User clicks Simulate in CanvasToolbar.
2. Toolbar reads nodes and edges from useCanvasStore.
3. Toolbar calls buildTscircuitJSX(nodes, edges).
4. Toolbar calls simulateCircuitServer(jsx).
5. Server Action writes temp TSX file and runs:
   - bun scripts/tscircuit-runner.ts <temp-file>
6. Runner executes runTscircuitCode(jsxContent).
7. JSON circuit result returns to toolbar.
8. Toolbar normalizes probe data:
   - Uses real simulation probeData if present.
   - Falls back to generated mock waveform if probe data is missing.
9. Toolbar stores simulationResult in Zustand.
10. Toolbar runs task.validate(nodes, edges, simResult).
11. Result drives:
   - success/failure toast
   - XP/badge progression
   - confetti on pass

Gamification state:
- [lib/store/usePlayerStore.ts](lib/store/usePlayerStore.ts)
- UI badge/xp display: [components/gamification/XPBar.tsx](components/gamification/XPBar.tsx)

## 6) Where Validation Result Is Reflected in UI

Main panel composition:
- [components/tasks/TaskShell.tsx](components/tasks/TaskShell.tsx)

Right panel includes:
- Schematic area: [components/simulation/SchematicPreview.tsx](components/simulation/SchematicPreview.tsx)
- Waveform area: [components/simulation/WaveformChart.tsx](components/simulation/WaveformChart.tsx)
- Status card: [components/tasks/ValidationFeedback.tsx](components/tasks/ValidationFeedback.tsx)

Current behavior to know:
- Validation pass/fail messaging is primarily shown via toast in CanvasToolbar.
- ValidationFeedback currently displays status based on whether a simulation result exists.

## 7) Route Wiring for Half-Wave Task

Learn route page:
- [app/learn/[taskSlug]/page.tsx](app/learn/[taskSlug]/page.tsx)

Layout wrapper (XP bar and badges shown at top):
- [app/learn/layout.tsx](app/learn/layout.tsx)

How task is loaded:
1. URL /learn/half-wave-rectifier resolves taskSlug.
2. taskSlug is looked up in taskRegistry.
3. TaskShell receives taskSlug and renders task-driven UI.

## 8) End-to-End Sequence (Simple)

1. Drag components and connect wires on XYFlow canvas.
2. XYFlow updates Zustand graph state (nodes/edges).
3. Click Simulate.
4. Graph converts to tscircuit TSX.
5. Server Action executes TSX via Bun runner and @tscircuit/eval.
6. Simulation JSON returns to client.
7. Task validator checks expected half-wave behavior.
8. UI updates waveform/status and awards XP/badge on success.

## 9) External Reading Links (Beginner-Friendly)

Next.js and Server Components:
- Next.js App Router docs: https://nextjs.org/docs/app
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components

XYFlow (React Flow):
- Official docs: https://reactflow.dev/

tscircuit and simulation:
- tscircuit package: https://www.npmjs.com/package/tscircuit
- @tscircuit/core: https://www.npmjs.com/package/@tscircuit/core
- @tscircuit/eval: https://www.npmjs.com/package/@tscircuit/eval
- schematic viewer: https://www.npmjs.com/package/@tscircuit/schematic-viewer

State management (Zustand):
- Official docs: https://zustand.docs.pmnd.rs/

Bun runtime:
- Bun docs: https://bun.sh/docs

## 10) Quick Debug Checklist for This Flow

1. No waveform after Simulate:
- Check [app/actions/simulateCircuit.ts](app/actions/simulateCircuit.ts) for Bun execution errors.
- Check [scripts/tscircuit-runner.ts](scripts/tscircuit-runner.ts) output path and JSON stdout.

2. Validation fails unexpectedly:
- Confirm probe naming expected by task validator in [lib/tasks/halfWaveRectifier.ts](lib/tasks/halfWaveRectifier.ts) (VP_OUT expected).
- Confirm probe node is connected so circuitBuilder can emit voltageprobe connectsTo.

3. Wrong pin behavior:
- Verify handle IDs in [components/canvas/CircuitNode.tsx](components/canvas/CircuitNode.tsx).
- Verify handle-to-pin mapping in [lib/simulation/circuitBuilder.ts](lib/simulation/circuitBuilder.ts).
