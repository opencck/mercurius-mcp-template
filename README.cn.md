[English](README.md) | [Русский](README.ru.md) | **中文**

# mercurius-mcp-template

一个无依赖、通过 stdio 通信的最小 MCP 服务器。它既是 [Mercurius](https://github.com/opencck/mercurius)
安装到其沙箱中的 MCP 服务器的模板，也是用于检验安装流程的测试服务器。

## 工具

| 工具 | 作用 | 标注 |
|------|------|------|
| `echo` | 返回传入的文本 | 只读 |
| `confirm` | 请求客户端确认（MCP elicitation），然后回复 `confirmed` 或说明原因 | 非破坏性 |

## 安装到 Mercurius

请对代理说：“安装 https://github.com/opencck/mercurius-mcp-template”。仓库中带有现成的计划
`mercurius.mcp.json`：步骤（`npm run check`）以及 `.mcp.json` 条目，其中 `${INSTALL_DIR}` 会替换为已安装版本的目录。

## 手动运行

```sh
node index.js
```

服务器从 stdin 逐行读取 JSON-RPC 消息，并将回复写入 stdout。

## 检查

```sh
npm run check
```

## 许可证

MIT — 见 [LICENSE](LICENSE)。
