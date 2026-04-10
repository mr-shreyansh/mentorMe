"use server";

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import "@tscircuit/eval";

const execFileAsync = promisify(execFile);

export async function simulateCircuitServer(jsxString: string) {
  const tmpDir = os.tmpdir();
  const jsxPath = path.join(tmpDir, `tscircuit-${Date.now()}-${Math.random().toString(36).substring(7)}.tsx`);

  try {
    fs.writeFileSync(jsxPath, jsxString, "utf8");

    const runnerPath = path.join(process.cwd(), "scripts", "tscircuit-runner.mjs");
    const { stdout } = await execFileAsync(process.execPath, [runnerPath, jsxPath]);

    const result = JSON.parse(stdout.trim());

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Unknown evaluation error"
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    console.error("SPICE Evaluation Execution Error:", error);
    return {
      success: false,
      error: error.message || "Unknown execution error"
    };
  } finally {
    if (fs.existsSync(jsxPath)) {
      fs.unlinkSync(jsxPath);
    }
  }
}
