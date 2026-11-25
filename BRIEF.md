# mercurius-mcp-template

## Назначение и границы

Минимальный MCP-сервер по stdio без зависимостей: образец для MCP, которые Меркурий ставит в песочницу
(`mcp_install`), и тестовый сервер для проверки установки и запроса подтверждения от сервера. Не входит: сеть,
секреты, файлы — у шаблона их нет намеренно.

## Устройство

- `index.js` — JSON-RPC по строкам stdin/stdout: `initialize`, `tools/list`, `tools/call`, `ping`.
- Инструменты: `echo` (`readOnlyHint`), `confirm` — спрашивает клиента `elicitation/create` с полем `confirm: boolean`
  и отвечает по его `action`; клиент без `elicitation` в `initialize` получает отказ без вопроса.
- `mercurius.mcp.json` — готовый план для Меркурия: `steps` и `entry` с `${INSTALL_DIR}`.

## Решения

- Без зависимостей: установка — одна проверка, без `npm install`, пакетов для OSV нет.
- Пометки инструментов — подсказки сервера: классы опасности при установке задаёт одобряющий.

## Проверки

`npm run check` — синтаксис и тесты `node --test`; то же в GitHub Actions (Node 20) при push в `master`.
