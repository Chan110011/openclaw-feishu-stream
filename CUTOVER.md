# Production Cutover Runbook

This runbook describes how to switch the main Feishu communication path from the official OpenClaw Feishu channel to this fork.

Do not execute these steps casually. The fork and the official plugin both own the `feishu` channel, so only one should be active in the production gateway at any time.

## Scope

- Target OpenClaw version: `2026.5.22`
- Fork plugin id: `openclaw-feishu-stream`
- Channel id: `feishu`
- Production profile: main OpenClaw profile
- Development profile: `feishu-stream-dev`

## Hard Rules

- Do not run the official Feishu channel and this fork against the same production Feishu app at the same time.
- Do not reuse the production Feishu app in `feishu-stream-dev` while the production gateway is running.
- Keep a backup of the main OpenClaw config before changing anything.
- Keep the official plugin rollback path ready before enabling this fork in production.

## Pre-Cutover Checklist

- Current main Feishu communication is healthy.
- Test app regression is passing; see [REGRESSION.md](./REGRESSION.md).
- Main profile Feishu app credentials are known or recoverable.
- You know how the official Feishu plugin is installed and enabled in the main profile.
- You have terminal access to stop/start the production gateway.
- You have a quiet maintenance window for Feishu bot users.
- You have decided what exact user-facing test messages will be sent after cutover.

## Backup

Create a dated backup directory outside the repository:

```bash
mkdir -p ~/openclaw-backups/feishu-cutover-$(date +%Y%m%d-%H%M%S)
```

Copy the main OpenClaw config and relevant agent auth/model files into that directory. The exact profile path may vary by installation, so verify before copying:

```bash
openclaw config path
```

Typical files to preserve:

- Main OpenClaw config file.
- Main agent `auth-profiles.json`.
- Main agent `models.json`.
- Any plugin install records or local extension links used by the official Feishu plugin.

Never commit these backup files.

## Dry Run Checks

Before touching production, confirm the fork still works in the isolated profile:

```bash
npm install
npm run build
npm run lint
npm run dev:inspect
npm run dev:doctor
```

Then run the test gateway with the separate test Feishu app:

```bash
npm run dev:gateway
```

Re-check:

- Direct message.
- Group mention.
- Long streaming reply.
- Markdown list/code/table.
- Tool call status.
- Error reply path.

Stop the dev gateway before production cutover.

## Cutover Plan

1. Announce the maintenance window.
2. Stop the production OpenClaw gateway.
3. Back up the main profile config and agent auth/model files.
4. Disable or unlink the official Feishu plugin from the main profile.
5. Install or link this fork into the main profile.
6. Confirm only one plugin owns the `feishu` channel.
7. Start the production gateway.
8. Watch gateway logs for startup, plugin loading, Feishu websocket readiness, and errors.
9. Send production smoke-test messages.

## Production Smoke Tests

Run these in order:

- Direct chat: short one-line reply.
- Direct chat: long streaming reply.
- Direct chat: Markdown list/code/table.
- Group chat: mention the bot and request a one-line reply.
- Tool call: request a harmless Feishu user/chat lookup.
- Error path: request access to a document the bot cannot read and confirm the error is explained cleanly.

Pass criteria:

- Feishu websocket reaches ready state.
- Messages are not duplicated.
- Replies stream into cards.
- Final card state is completed.
- Tool status appears during tool calls.
- Gateway logs do not show repeated unhandled exceptions.

## Immediate Rollback Triggers

Rollback immediately if any of these happen:

- Production users stop receiving replies.
- Replies are duplicated or arrive in the wrong chat.
- Gateway repeatedly crashes or reconnects.
- The production Feishu app appears to be consumed by two gateways.
- Permission or auth failures affect ordinary direct/group replies.
- Card updates fail consistently.

## Rollback Plan

1. Stop the production gateway.
2. Unlink or disable this fork from the main profile.
3. Restore the official Feishu plugin installation or enablement.
4. Restore the backed-up main config if needed.
5. Start the production gateway.
6. Verify direct chat and group mention replies through the official plugin.
7. Record the failing symptom and the gateway logs before another cutover attempt.

## Post-Cutover Tasks

- Keep the backup until the fork has been stable for several days.
- Update [REGRESSION.md](./REGRESSION.md) with production smoke-test results.
- Tag a known-good commit after stable production operation.
- Document any manual config changes made during cutover.
