# Regression Notes

## Environment

- Date: 2026-05-28
- OpenClaw: `2026.5.22 (a374c3a)`
- Profile: `feishu-stream-dev`
- Gateway port: `19002`
- Feishu connection mode: websocket
- Branch: `compat/openclaw-2026.5.22`

The regression run uses a separate test Feishu app and does not touch the main OpenClaw profile.

## Results

| Case | Status | Notes |
| --- | --- | --- |
| Direct chat, short message | Pass | Message received, dispatched to agent, and completed with `replies=1`. |
| Direct chat, longer streaming reply | Pass | Message received, dispatched to agent, and completed with `replies=1`. |
| Markdown list/code/table | Pass | Message received and completed with `replies=1`; no markdown/card conversion errors observed in gateway logs. |
| Group chat with mention | Pass | Bot-added event received, group message dispatched with group-scoped session, and completed with `replies=1`. |
| Two quick consecutive messages | Pass | First message ran immediately; second was queued and dispatched after the first completed. Both completed with `replies=1`. |
| Tool call status display | Pass | Tool calls observed for `feishu_get_user`, `feishu_chat`, and `feishu_chat_members`; replies completed. Visual card status should still be checked manually in Feishu. |
| Error/interruption behavior | Pass | Feishu doc permission/user-authorization errors were surfaced without breaking dispatch; replies still completed with `replies=1`. |

## Observed Warnings

- `plugin runtime config.loadConfig() is deprecated (runtime-config-load-write); use config.current().`
- `no im.message.reaction.deleted_v1 handle`
- Node deprecation warning for `url.parse()`.
- One transient model fetch failure with `ECONNRESET`; the run recovered and completed a reply.
- Duplicate reaction event skipped by message dedup logic.

These warnings did not block the direct-message reply path in the current run.
