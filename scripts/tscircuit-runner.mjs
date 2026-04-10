import { runTscircuitCode } from "@tscircuit/eval";
import fs from "fs";

const jsxPath = process.argv[2];

if (!jsxPath || !fs.existsSync(jsxPath)) {
  console.error(JSON.stringify({ error: "No valid JSX file path provided" }));
  process.exit(1);
}

const jsxContent = fs.readFileSync(jsxPath, "utf8");

try {
  const circuitObj = await runTscircuitCode(jsxContent);
  console.log(JSON.stringify(circuitObj));
  process.exit(0);
} catch (err) {
  const message = err instanceof Error ? err.message : "Failed to evaluate circuit JSX";
  console.error(message);
  process.exit(1);
}
