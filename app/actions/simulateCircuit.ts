"use server";

import fs from "fs";
import path from "path";
import os from "os";
import "@tscircuit/eval";
import { runTscircuitCode } from "@tscircuit/eval";

export async function simulateCircuitServer(jsxString: string) {
  const tmpDir = os.tmpdir();
  const jsxPath = path.join(
    tmpDir,
    `tscircuit-${Date.now()}-${Math.random().toString(36).substring(7)}.tsx`,
  );

  try {
    const result = await runTscircuitCode(jsxString);

    if (!result) {
      return {
        success: false,
        error: "Unknown evaluation error",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("SPICE Evaluation Execution Error:", error);
    return {
      success: false,
      error: error.message || "Unknown execution error",
    };
  } finally {
    if (fs.existsSync(jsxPath)) {
      fs.unlinkSync(jsxPath);
    }
  }
}
