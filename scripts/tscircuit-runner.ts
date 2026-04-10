import { runTscircuitCode } from "@tscircuit/eval";
import * as fs from "fs";

const jsxPath = process.argv[2];

if (!jsxPath || !fs.existsSync(jsxPath)) {
  console.error(JSON.stringify({ error: "No valid JSX file path provided" }));
  process.exit(1);
}

const jsxContent = fs.readFileSync(jsxPath, "utf-8");

export async function run() {
  try {
    const circuitObj = await runTscircuitCode(jsxContent);
    // Print the clean JSON output exactly to stdout for the sub-process to capture
    console.log(JSON.stringify(circuitObj));
    process.exit(0);
  } catch (err: any) {
    console.error(err.message || "Failed to evaluate circuit JSX");
    process.exit(1);
  }
}

run();
