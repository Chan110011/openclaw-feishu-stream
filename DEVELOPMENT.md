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

## Safe Local Workflow

Use the isolated OpenClaw profile `feishu-stream-dev` for development checks:

```bash
npm install
npm run build
npm run dev:configure
npm run dev:link
npm run dev:inspect
npm run dev:doctor
npm run dev:gateway
```

Do not install this plugin into the main OpenClaw profile until there is an explicit cutover and rollback plan. The production cutover must account for the fact that only one plugin should own the `feishu` channel at a time.

`dev:configure` requires a separate test Feishu/Lark app:

```bash
FEISHU_STREAM_DEV_APP_ID=cli_xxx \
FEISHU_STREAM_DEV_APP_SECRET=xxx \
npm run dev:configure
```

Do not reuse the production Feishu/Lark app while the main gateway is running. Two websocket clients for the same app can consume the same event stream and cause duplicate or missing replies.

`dev:gateway` uses `127.0.0.1:19002` so it does not collide with the main gateway's default port.

## Identity Model

- Plugin id: `openclaw-feishu-stream`
- Channel id: `feishu`

The plugin id is unique so the fork can be tracked independently. The channel id remains `feishu` because the fork intentionally replaces the Feishu channel implementation during a planned cutover.
