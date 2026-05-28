# OpenClaw Feishu Stream Development Notes

## Goal

Build a maintainable Feishu streaming-card fork for `OpenClaw 2026.5.x`, preserving the user experience proven by `ColinLu50/openclaw-lark-stream` while reducing compatibility risk with newer OpenClaw releases.

## Current Baseline

- Local OpenClaw version: `2026.5.22 (a374c3a)`
- Upstream reference: `ColinLu50/openclaw-lark-stream`
- Working branch: `compat/openclaw-2026.5.22`

## Strategy

Use the current official `@openclaw/feishu@2026.5.22` plugin as the compatibility baseline and port only the streaming-card experience layer:

- `src/card/streaming-card-controller.ts`
- `src/card/cardkit.ts`
- `src/card/builder.ts`
- `src/card/flush-controller.ts`
- `src/card/reply-mode.ts`
- `src/core/footer-config.ts`

Avoid carrying forward old OpenClaw integration code unless it is still required after comparison with the 2026.5.22 Feishu plugin.

## Git Remotes

- `upstream`: ColinLu50 reference repository, fetch only
- `origin`: reserved for the user's GitHub repository

