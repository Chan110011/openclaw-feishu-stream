[English](./README.en.md) | 中文

# OpenClaw Feishu Stream

面向 `OpenClaw 2026.5.x` 的飞书流式卡片二开版本。当前以 [ColinLu50/openclaw-lark-stream](https://github.com/ColinLu50/openclaw-lark-stream) 为体验参考，目标是把满意的流式卡片、工具状态、推理面板和底栏能力移植到新版 OpenClaw Feishu 插件兼容层上。
<img src="./assets/demo.gif" width="480" />

<sub>▲ 群中真流式输出，并显示全部执行逻辑</sub>

<img src="./assets/demo_footer.png" width="480" />

<sub>▲ 卡片底栏：完成状态、响应耗时、token 用量、context 使用率，均可独立开关</sub>



## ✨ 改动说明

官方插件在 LLM 生成完一个 block 后才一次性推送结果。本版本实现了：

- **实时流式输出** — 每个 block 的内容在生成过程中逐步追加到飞书卡片
- **群聊流式输出** — 群聊中也可使用流式输出
- **Agent 执行过程可视化** — 完整还原 agent 的推理与执行流程
  - **推理过程展示** — 推理模型（DeepSeek-R1、Claude 3.7 等）的 think 内容实时流出
  - **工具调用状态** — agent 调用工具时，卡片顶部实时显示当前工具名称
  - **思考过程面板** — 完成后，所有推理块和工具调用按发生顺序折叠进一个可展开面板
  - **Token 用量展示** — 卡片底部默认显示 input/output token 数和 context 使用百分比

## 📢 当前状态

- **2026.5.28**
  - 当前分支适配并实测 `OpenClaw 2026.5.22 (a374c3a)`。
  - 已改为独立插件 id `openclaw-feishu-stream`，便于和原项目、官方插件区分。
  - 已补齐 `OpenClaw 2026.5.22` 需要的 SDK 兼容层和 `describeMessageTool` action discovery。
  - 已加入隔离开发 profile `feishu-stream-dev`，本地测试不会改动主 OpenClaw profile。
  - 当前仍处于源码开发阶段，生产切换前需要完整回归测试和回滚方案。

更多兼容性记录见 [COMPATIBILITY.md](./COMPATIBILITY.md)。

## 📦 安装

需要 [OpenClaw](https://openclaw.ai) 和 Node.js（>= v22）。

> [!WARNING]
> 当前仓库处于 `OpenClaw 2026.5.22` 适配开发阶段，安装脚本和发布包名尚未固定。不要直接安装到主 profile 覆盖生产飞书通信。

### 从源码安装（开发用）

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

开发脚本使用隔离 profile `feishu-stream-dev`，不会改动主 OpenClaw 配置或当前正在使用的飞书插件。

`dev:configure` 需要独立测试飞书 App。可以交互式输入，也可以通过环境变量传入：

```bash
FEISHU_STREAM_DEV_APP_ID=cli_xxx \
FEISHU_STREAM_DEV_APP_SECRET=xxx \
npm run dev:configure
```

不要复用生产飞书 App 同时启动 dev gateway。两个 gateway 使用同一个 App websocket 时，消息事件可能被重复消费。

`dev:gateway` 固定使用 `127.0.0.1:19002`，避免和主 OpenClaw gateway 默认端口混用。

> [!WARNING]
> 生产切换前不要把本插件直接安装到主 profile。它和官方 Feishu 插件都声明 `feishu` channel，真实接入时必须只保留一个 Feishu channel 处理器在线，并准备回滚步骤。

生产切换步骤见 [CUTOVER.md](./CUTOVER.md)。

## ⚙️ 配置

### 流式输出

安装后默认开启流式输出。如需关闭：

```bash
openclaw config set channels.feishu.streaming false
openclaw config set channels.feishu.replyMode.direct static
openclaw config set channels.feishu.replyMode.group static
openclaw config set channels.feishu.replyMode.default static
openclaw gateway restart
```

重新开启：

```bash
openclaw config set channels.feishu.streaming true
openclaw config set channels.feishu.replyMode.direct streaming
openclaw config set channels.feishu.replyMode.group streaming
openclaw config set channels.feishu.replyMode.default streaming
openclaw gateway restart
```

### 卡片底栏

底栏各项均可通过 `channels.feishu.footer.*` 独立开关，修改后重启生效：

```bash
openclaw gateway restart
```

| 配置项 | 默认 | 说明 |
|--------|------|------|
| `footer.verbose` | ❌ 关 | 详细模式：各项改用文字标签展示 |
| `footer.status` | ✅ 开 | 完成状态 |
| `footer.elapsed` | ✅ 开 | 总响应耗时 |
| `footer.tokens` | ✅ 开 | input / output token 数 |
| `footer.context` | ✅ 开 | context window 使用率 |
| `footer.cache` | ❌ 关 | 缓存命中（需单独开启） |
| `footer.model` | ❌ 关 | 模型名称（需单独开启） |

`verbose` 只控制**展示格式**，各项的开关相互独立：

| 项目 | 简要（默认） | 详细（verbose） |
|------|------------|----------------|
| status | `✅` / `❌` / `⏹` | `已完成` / `出错` / `已停止` |
| elapsed | `8.3s` | `耗时 8.3s` |
| context | `1% ctx` | `上下文 19k/200k (10%)` |
| cache | `94% cache` | `缓存 18k/1k (94%)` |
| tokens | `↑ 19k ↓ 145` | `输入 19k 输出 145` |
| model | 相同 | 相同 |

默认效果：

```
✅ · 8.3s · ↑ 19k ↓ 145 · 1% ctx
```

开启详细模式 + cache + model：

```bash
openclaw config set channels.feishu.footer.verbose true
openclaw config set channels.feishu.footer.cache true
openclaw config set channels.feishu.footer.model true
openclaw gateway restart
```

效果：

```
已完成 · 耗时 8.3s · 输入 19k 输出 145 · 缓存 18k/1k (94%) · 上下文 19k/200k (10%) · claude-3-7-sonnet
```

示例 — 关闭 token 展示，开启模型名称：

```bash
openclaw config set channels.feishu.footer.tokens false
openclaw config set channels.feishu.footer.model true
openclaw gateway restart
```

## 📄 许可证

MIT
