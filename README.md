# OpenClaw Feishu Stream

这是一个面向 `OpenClaw 2026.5.x` 的飞书流式卡片插件 fork。项目借鉴了 [ColinLu50/openclaw-lark-stream](https://github.com/ColinLu50/openclaw-lark-stream) 的流式卡片体验，并适配新版 OpenClaw 插件 API。

当前生产验证版本：

- OpenClaw：`2026.5.22`
- 插件 id：`openclaw-feishu-stream`
- Channel id：`feishu`
- 运行方式：本地源码 link 到 OpenClaw 主 profile

<img src="./assets/demo.gif" width="480" />

<sub>群聊中的流式卡片输出和执行过程展示</sub>

<img src="./assets/demo_footer.png" width="480" />

<sub>卡片底栏支持耗时、token、context、当前模型等运行信息</sub>

## 功能特性

- 飞书卡片实时流式输出，生成过程中持续更新内容。
- 私聊和群聊均可启用 streaming card。
- 展示推理过程、工具调用状态和最终执行轨迹。
- 卡片底栏显示完成状态、耗时、input/output token、context 使用率和当前运行模型。
- 保留官方 Feishu 插件的大部分工具能力，包括文档、云空间、多维表格、日历、任务、消息等工具。
- 独立插件 id，方便和官方 `@openclaw/feishu` 区分。

## 适用范围

本仓库目前主要适配并测试：

- `OpenClaw 2026.5.22`
- Node.js `>= 22`
- 飞书/Lark WebSocket 连接模式

如果升级 OpenClaw，建议先在隔离 profile 中回归测试，再切换生产 profile。兼容性记录见 [COMPATIBILITY.md](./COMPATIBILITY.md)，生产切换流程见 [CUTOVER.md](./CUTOVER.md)。

## 安装前注意

> [!WARNING]
> 官方 `@openclaw/feishu` 和本插件都声明 `feishu` channel。生产环境中同一时间只能启用一个 Feishu channel 处理器，否则可能导致同一个飞书 App 的消息被重复消费或连接互相抢占。

建议先用隔离 profile 测试。确认效果后，再在维护窗口内执行生产安装。

## 从源码安装

```bash
git clone https://github.com/Chan110011/openclaw-feishu-stream.git
cd openclaw-feishu-stream
npm install
npm run build
```

## 隔离开发测试

开发测试使用独立 profile `feishu-stream-dev`，不会改动主 OpenClaw 配置。

```bash
npm run dev:configure
npm run dev:link
npm run dev:inspect
npm run dev:doctor
npm run dev:gateway
```

也可以通过环境变量配置测试飞书 App：

```bash
FEISHU_STREAM_DEV_APP_ID=cli_xxx \
FEISHU_STREAM_DEV_APP_SECRET=xxx \
npm run dev:configure
```

开发 gateway 默认端口是 `19002`。不要在生产 gateway 正在使用同一个飞书 App 时启动 dev gateway。

## 生产安装

以下命令会影响当前飞书通信，请先确认维护窗口。

在本仓库目录执行：

```bash
BACKUP_DIR=~/openclaw-backups/feishu-cutover-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
cp ~/.openclaw/openclaw.json "$BACKUP_DIR/openclaw.json"
npm install
npm run build
openclaw plugins disable feishu
openclaw plugins install --link .
openclaw config patch --stdin <<'JSON'
{
  channels: {
    feishu: {
      streaming: true,
      replyMode: {
        direct: "streaming",
        group: "streaming",
        default: "streaming"
      },
      footer: {
        model: true
      }
    }
  }
}
JSON
openclaw gateway restart
```

安装后检查：

```bash
openclaw gateway status
openclaw plugins doctor
openclaw plugins inspect openclaw-feishu-stream --runtime
openclaw plugins inspect feishu --runtime
openclaw channels status
```

预期结果：

- `openclaw-feishu-stream`：`loaded`
- 官方 `feishu`：`disabled`
- Feishu channel：`ON / OK`

备份文件保存在 `$BACKUP_DIR/openclaw.json`。不要把备份配置提交到 GitHub。

## 烟测建议

生产切换后至少测试：

- 私聊短回复。
- 私聊长回复，确认卡片持续流式更新。
- 群聊 @ 机器人，确认不会重复回复。
- Markdown 列表、代码块、表格。
- 工具调用场景，确认工具状态和最终内容正常。
- 卡片底栏是否显示耗时、token、context、当前模型。

## 回滚

如果飞书消息无法回复、重复回复、卡片更新失败或 gateway 持续报错，可以切回官方插件：

```bash
openclaw plugins disable openclaw-feishu-stream
openclaw plugins enable feishu
openclaw config set channels.feishu.streaming false
openclaw config set channels.feishu.replyMode.direct static
openclaw config set channels.feishu.replyMode.group static
openclaw config set channels.feishu.replyMode.default static
openclaw gateway restart
```

如配置已损坏，直接恢复安装前备份的 `~/.openclaw/openclaw.json`，再重启 gateway。

## 配置说明

### 流式输出

关闭流式卡片：

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

底栏各项均可通过 `channels.feishu.footer.*` 独立开关，修改后重启生效。

| 配置项 | 默认 | 说明 |
|--------|------|------|
| `footer.verbose` | 关 | 详细模式，各项改用文字标签展示 |
| `footer.status` | 开 | 完成状态 |
| `footer.elapsed` | 开 | 总响应耗时 |
| `footer.tokens` | 开 | input / output token 数 |
| `footer.context` | 开 | context window 使用率 |
| `footer.cache` | 关 | 缓存命中 |
| `footer.model` | 开 | 当前运行模型 |

默认效果类似：

```text
✅ · 57.8s · ↑ 54.7k ↓ 531 · 27% ctx · gpt-5.5
```

开启详细模式：

```bash
openclaw config set channels.feishu.footer.verbose true
openclaw gateway restart
```

## 开发命令

```bash
npm run build
npm run lint
npm run dev:inspect
npm run dev:doctor
```

`npm run lint` 当前可能保留一批既有类型 warning，只要没有 error 即可继续测试。

## 版本更新

### v0.1.1

- 修复飞书发送 `/new`、`/reset` 等 OpenClaw 控制命令后没有回复的问题。
- 控制命令继续使用纯文本回复，不进入流式卡片，避免和普通对话输出混在一起。
- 已在 `OpenClaw 2026.5.22` 下验证：普通文字回复、流式卡片回复、`/new` 命令回复均正常。

## 许可证

MIT
