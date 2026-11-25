**English** | [Русский](README.ru.md) | [中文](README.cn.md)

# mercurius-mcp-template

A minimal MCP server over stdio with no dependencies. It is a template for MCP servers that
[Mercurius](https://github.com/opencck/mercurius) installs into its sandbox, and a test server for the install flow.

## Tools

| Tool | What it does | Hint |
|------|--------------|------|
| `echo` | Returns the text it was given | read only |
| `confirm` | Asks the client to confirm (MCP elicitation), then answers `confirmed` or why not | not destructive |

## Installing into Mercurius

Ask the agent: “install https://github.com/opencck/mercurius-mcp-template”. The repository carries a ready plan in
`mercurius.mcp.json`: the steps (`npm run check`) and the entry for `.mcp.json`, where `${INSTALL_DIR}` becomes the
folder of the installed revision.

## Running by hand

```sh
node index.js
```

The server reads JSON-RPC messages from stdin, one per line, and writes answers to stdout.

## Checks

```sh
npm run check
```

## License

MIT — see [LICENSE](LICENSE).
