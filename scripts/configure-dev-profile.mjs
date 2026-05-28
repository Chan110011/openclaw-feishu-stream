#!/usr/bin/env node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const PROFILE = "feishu-stream-dev";

function readEnv(name, fallback) {
  const value = process.env[name];
  if (value == null || value.trim() === "") return fallback;
  return value.trim();
}

async function promptMissingCredentials() {
  const rl = createInterface({ input, output });
  try {
    const appId = readEnv("FEISHU_STREAM_DEV_APP_ID") ?? (await rl.question("Test Feishu App ID: "));
    const appSecret =
      readEnv("FEISHU_STREAM_DEV_APP_SECRET") ?? (await rl.question("Test Feishu App Secret: "));
    return {
      appId: appId.trim(),
      appSecret: appSecret.trim(),
    };
  } finally {
    rl.close();
  }
}

const { appId, appSecret } = await promptMissingCredentials();
const domain = readEnv("FEISHU_STREAM_DEV_DOMAIN", "feishu");
const connectionMode = readEnv("FEISHU_STREAM_DEV_CONNECTION_MODE", "websocket");

if (!appId || !appSecret) {
  console.error("Missing required test Feishu App ID or App Secret.");
  console.error("");
  console.error("Use a separate test Feishu/Lark app. Do not reuse the production app while the main gateway is running.");
  console.error("");
  console.error("Example:");
  console.error("  FEISHU_STREAM_DEV_APP_ID=cli_xxx \\");
  console.error("  FEISHU_STREAM_DEV_APP_SECRET=xxx \\");
  console.error("  npm run dev:configure");
  process.exit(2);
}

if (!["feishu", "lark"].includes(domain) && !domain.startsWith("https://")) {
  console.error("FEISHU_STREAM_DEV_DOMAIN must be feishu, lark, or an https:// URL.");
  process.exit(2);
}

if (!["websocket", "webhook"].includes(connectionMode)) {
  console.error("FEISHU_STREAM_DEV_CONNECTION_MODE must be websocket or webhook.");
  process.exit(2);
}

const updates = [
  { path: "channels.feishu.enabled", value: true },
  { path: "channels.feishu.appId", value: appId },
  { path: "channels.feishu.appSecret", value: appSecret },
  { path: "channels.feishu.connectionMode", value: connectionMode },
  { path: "channels.feishu.domain", value: domain },
  { path: "channels.feishu.dmPolicy", value: "open" },
  { path: "channels.feishu.allowFrom", value: ["*"] },
  { path: "channels.feishu.groupPolicy", value: "open" },
  { path: "channels.feishu.groupAllowFrom", value: ["*"] },
  { path: "channels.feishu.requireMention", value: true },
  { path: "channels.feishu.streaming", value: true },
  { path: "channels.feishu.blockStreaming", value: false },
  {
    path: "channels.feishu.replyMode",
    value: {
      direct: "streaming",
      group: "streaming",
      default: "streaming",
    },
  },
  {
    path: "channels.feishu.footer",
    value: {
      verbose: false,
      status: true,
      elapsed: true,
      tokens: true,
      cache: false,
      context: true,
      model: false,
    },
  },
];

const tempDir = mkdtempSync(join(tmpdir(), "openclaw-feishu-stream-config-"));
const batchFile = join(tempDir, "config-set.batch.json");

try {
  writeFileSync(batchFile, JSON.stringify(updates, null, 2), "utf8");
  const result = spawnSync("openclaw", ["--profile", PROFILE, "config", "set", "--batch-file", batchFile], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log("");
  console.log(`Configured isolated OpenClaw profile "${PROFILE}" for Feishu stream testing.`);
  console.log("Next steps:");
  console.log("  npm run build");
  console.log("  npm run dev:link");
  console.log("  npm run dev:inspect");
  console.log("  npm run dev:doctor");
  console.log("  npm run dev:gateway");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
