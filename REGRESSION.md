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
| Markdown list/code/table | Pending | Needs a message requesting list, code block, and table output. |
| Group chat with mention | Pending | Requires testing in a group with the test bot mentioned. |
| Two quick consecutive messages | Pending | Needs two back-to-back messages in the same chat. |
| Tool call status display | Pending | Needs a prompt that triggers a Feishu or OpenClaw tool call. |
| Error/interruption behavior | Pending | Needs an intentional failure or interruption scenario. |

## Observed Warnings

- `plugin runtime config.loadConfig() is deprecated (runtime-config-load-write); use config.current().`
- `no im.message.reaction.deleted_v1 handle`
- Node deprecation warning for `url.parse()`.

These warnings did not block the direct-message reply path in the current run.
