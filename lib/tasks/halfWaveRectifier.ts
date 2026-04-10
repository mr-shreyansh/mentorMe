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
      const allProbes = Object.keys(simResult.probeData);
      return { 
        passed: false, 
        score: 30, 
        feedback: `Add a voltageprobe at the output (after the diode). Found probes: ${allProbes.join(", ")}` 
      };
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
