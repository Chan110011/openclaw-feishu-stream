# Compatibility

## Current Target

- OpenClaw: `2026.5.22 (a374c3a)`
- Node.js: `>= 22`
- Branch: `compat/openclaw-2026.5.22`
- Plugin id: `openclaw-feishu-stream`
- Channel id: `feishu`

This fork is developed against the user's currently installed OpenClaw version. It is not a drop-in release package yet.

## What Is Verified

- Plugin loads on OpenClaw `2026.5.22`.
- `npm run build` succeeds.
- `npm run lint` exits with `0` and existing warnings only.
- Isolated profile `feishu-stream-dev` can receive Feishu websocket events from a separate test app.
- `describeMessageTool` compatibility for OpenClaw `2026.5.22` is implemented.
- Test direct messages can dispatch to the agent and complete replies.

## Known Constraints

- Only one plugin should own the `feishu` channel in a running OpenClaw gateway.
- Do not run this fork and the official Feishu channel against the same production Feishu app at the same time.
- Development scripts intentionally use `feishu-stream-dev` and port `19002` to avoid touching the main profile.
- The current package name and install flow are still development-oriented.
- Documentation and install scripts are being cleaned up from the original `ColinLu50/openclaw-lark-stream` project.

## Recommended Test Matrix

- Direct chat, short message.
- Direct chat, long streaming reply.
- Markdown lists, code blocks, and tables.
- Group chat with mention.
- Two quick consecutive messages in the same chat.
- Tool call status display.
- Error and interruption behavior.

## Production Cutover Notes

Before using this fork for the main Feishu communication path:

1. Back up the main OpenClaw config.
2. Stop the current Feishu gateway/channel.
3. Install or link this plugin into the main profile.
4. Start the gateway with only one active `feishu` channel owner.
5. Test direct and group chats.
6. Keep a rollback path to the official Feishu plugin.
