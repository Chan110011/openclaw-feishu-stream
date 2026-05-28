English | [中文](./README.md)

# OpenClaw Feishu Stream

An `OpenClaw 2026.5.x` Feishu/Lark streaming-card fork. The user experience is based on [ColinLu50/openclaw-lark-stream](https://github.com/ColinLu50/openclaw-lark-stream), while this repository focuses on compatibility with newer OpenClaw Feishu channel APIs.
<img src="./assets/demo.gif" width="480" />
<sub>▲ Real streaming in group chats with full execution trace</sub>

<img src="./assets/demo_footer.png" width="480" />
<sub>▲ Card footer: status, elapsed time, token usage, context usage — each toggleable independently</sub>

## ✨ What's Changed

The official plugin delivers LLM block results all at once after completion. This version enables:

- **Real-time streaming output** — each block's content is progressively appended to the Lark card as it's generated
- **Group chat streaming** — streaming output works in group chats as well
- **Agent execution visibility** — full transparency into the agent's reasoning and execution flow
  - **Reasoning display** — think content from reasoning models (DeepSeek-R1, Claude 3.7, etc.) streams live
  - **Tool call indicators** — when the agent calls a tool, the card shows the current tool name in real-time
  - **Process panel** — on completion, all reasoning blocks and tool calls are collapsed into a single expandable panel in chronological order
  - **Token usage** — the card footer shows input/output token counts and context window usage percentage by default

## 📢 Current Status

- **2026.5.28**
  - Current branch targets and has been tested with `OpenClaw 2026.5.22 (a374c3a)`.
  - Plugin id changed to `openclaw-feishu-stream` so the fork can be tracked separately.
  - SDK compatibility shims and `describeMessageTool` action discovery have been added for OpenClaw `2026.5.22`.
  - Development scripts use the isolated profile `feishu-stream-dev`, so local tests do not modify the main OpenClaw profile.
  - This is still a source-development branch. Production use needs a full regression pass and rollback plan.

See [COMPATIBILITY.md](./COMPATIBILITY.md) for compatibility notes.

## 📦 Installation

Requires [OpenClaw](https://openclaw.ai) and Node.js (>= v22).

> [!WARNING]
> This repository is currently adapted for `OpenClaw 2026.5.22`. The release package name and production install script are not finalized. Do not install it into the main profile until the production cutover plan is ready.

### From source (for development)

```bash
git clone https://github.com/Chan110011/openclaw-feishu-stream.git
cd openclaw-feishu-stream
npm install
npm run build
npm run dev:configure
npm run dev:link
npm run dev:inspect
npm run dev:doctor
npm run dev:gateway
```

Development scripts use the isolated OpenClaw profile `feishu-stream-dev`. They do not modify the main OpenClaw profile or the currently running Feishu plugin.

`dev:configure` needs a separate test Feishu/Lark app. You can enter credentials interactively or pass environment variables:

```bash
FEISHU_STREAM_DEV_APP_ID=cli_xxx \
FEISHU_STREAM_DEV_APP_SECRET=xxx \
npm run dev:configure
```

Do not reuse the production Feishu/Lark app while the main gateway is running. Two websocket clients for the same app can consume the same event stream and cause duplicate or missing replies.

`dev:gateway` uses `127.0.0.1:19002` to avoid colliding with the main gateway's default port.

> [!WARNING]
> Before production cutover, remember that this fork and the official Feishu plugin both declare the `feishu` channel. Only one Feishu channel owner should be online at a time.

See [CUTOVER.md](./CUTOVER.md) for the production cutover runbook.

## ⚙️ Configuration

### Streaming Output

Streaming is enabled by default after installation. To disable:

```bash
openclaw config set channels.feishu.streaming false
openclaw config set channels.feishu.replyMode.direct static
openclaw config set channels.feishu.replyMode.group static
openclaw config set channels.feishu.replyMode.default static
openclaw gateway restart
```

To re-enable:

```bash
openclaw config set channels.feishu.streaming true
openclaw config set channels.feishu.replyMode.direct streaming
openclaw config set channels.feishu.replyMode.group streaming
openclaw config set channels.feishu.replyMode.default streaming
openclaw gateway restart
```

### Card Footer

Each footer item can be toggled independently via `channels.feishu.footer.*`. Restart after changes:

```bash
openclaw gateway restart
```

| Option | Default | Description |
|--------|---------|-------------|
| `footer.verbose` | ❌ off | Verbose mode: use full text labels instead of compact format |
| `footer.status` | ✅ on | Completion state |
| `footer.elapsed` | ✅ on | Total response time |
| `footer.tokens` | ✅ on | Input / output token counts |
| `footer.context` | ✅ on | Context window usage |
| `footer.cache` | ❌ off | Cache hit rate (must enable separately) |
| `footer.model` | ✅ on | Current runtime model |

`verbose` only controls **display format** — each item's on/off is independent:

| Item | Compact (default) | Verbose |
|------|------------------|---------|
| status | `✅` / `❌` / `⏹` | `Completed` / `Error` / `Stopped` |
| elapsed | `8.3s` | `Elapsed 8.3s` |
| context | `1% ctx` | `Context 19k/200k (10%)` |
| cache | `94% cache` | `Cache 18k/1k (94%)` |
| tokens | `↑ 19k ↓ 145` | `In 19k Out 145` |
| model | same | same |

Default footer:

```
✅ · 8.3s · ↑ 19k ↓ 145 · 1% ctx
```

Enable verbose mode + cache + model:

```bash
openclaw config set channels.feishu.footer.verbose true
openclaw config set channels.feishu.footer.cache true
openclaw config set channels.feishu.footer.model true
openclaw gateway restart
```

Result:

```
Completed · Elapsed 8.3s · In 19k Out 145 · Cache 18k/1k (94%) · Context 19k/200k (10%) · claude-3-7-sonnet
```

Example — hide token counts, show model name:

```bash
openclaw config set channels.feishu.footer.tokens false
openclaw config set channels.feishu.footer.model true
openclaw gateway restart
```

## 📄 License

MIT
