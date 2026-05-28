#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0] ?? "help";

function printHelp() {
  console.log(`OpenClaw Feishu Stream development helper

This fork is intentionally conservative: it does not install into or mutate
your main OpenClaw profile from this CLI.

Safe local workflow:
  npm install
  npm run build
  npm run dev:configure
  npm run dev:link
  npm run dev:inspect
  npm run dev:doctor

The dev scripts use the isolated OpenClaw profile "feishu-stream-dev".
Use a separate test Feishu/Lark app for dev:configure.
Production cutover should be done manually with an explicit rollback plan.`);
}

if (command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

console.error(`Unsupported command: ${command}`);
console.error("Run `openclaw-feishu-stream help` for the safe development workflow.");
process.exit(1);
