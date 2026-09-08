import { fork } from "child_process";
import http from "http";
import path from "path";
import { runAllTests } from "./api.test";

async function waitForServer(url: string, timeoutMs = 20000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
        req.on("error", reject);
        req.end();
      });
      return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

async function main() {
  console.log("Launching server process for verification...");

  // Launch tsx server.ts
  const serverProcess = fork(path.resolve(process.cwd(), "server.ts"), [], {
    env: { ...process.env, PORT: "3000", NODE_ENV: "production" },
    execArgv: ["-r", "tsx/cjs"],
    stdio: "inherit",
  });

  const isReady = await waitForServer("http://localhost:3000/health");
  if (!isReady) {
    console.error("Server failed to respond to /health in time.");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Server responded healthy. Running test suite...");

  try {
    await runAllTests();
    console.log("All automated tests completed successfully!");
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
    process.exit(process.exitCode || 0);
  }
}

main();
