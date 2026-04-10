"use server";

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function simulateCircuitServer(jsxString: string) {
  try {
    const tmpDir = os.tmpdir();
    const jsxPath = path.join(tmpDir, `tscircuit-${Date.now()}-${Math.random().toString(36).substring(7)}.tsx`);
    
    fs.writeFileSync(jsxPath, jsxString, "utf8");

    const runnerPath = path.join(process.cwd(), "scripts", "tscircuit-runner.ts");
    
    // bun natively evaluates ts code and bypasses all Node 24 ESM strictness bugs for missing package exports
    const { stdout, stderr } = await execAsync(`bun ${runnerPath} ${jsxPath}`);
    
    if (fs.existsSync(jsxPath)) fs.unlinkSync(jsxPath);

    if (stderr && !stdout) {
      console.error("SPICE Evaluation Script Stderr:", stderr);
    }
    
    const circuitObj = JSON.parse(stdout.trim());

    return {
      success: true,
      data: circuitObj
    };
  } catch (error: any) {
    console.error("SPICE Evaluation Execution Error:", error);
    return {
      success: false,
      error: error.message || "Unknown execution error"
    };
  }
}
