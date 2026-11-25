'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');

function start() {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'index.js')], { stdio: ['pipe', 'pipe', 'inherit'] });
  const lines = readline.createInterface({ input: child.stdout });
  const queue = [];
  const waiting = [];
  lines.on('line', (line) => {
    const message = JSON.parse(line);
    const resolve = waiting.shift();
    resolve ? resolve(message) : queue.push(message);
  });
  return {
    send: (message) => child.stdin.write(JSON.stringify(message) + '\n'),
    read: () => (queue.length > 0 ? Promise.resolve(queue.shift()) : new Promise((resolve) => waiting.push(resolve))),
    stop: () => child.kill(),
  };
}

test('lists its tools and echoes', async () => {
  const server = start();
  server.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { capabilities: {} } });
  assert.equal((await server.read()).result.serverInfo.name, 'mercurius-mcp-template');
  server.send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.deepEqual((await server.read()).result.tools.map((t) => t.name), ['echo', 'confirm']);
  server.send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'echo', arguments: { text: 'hi' } } });
  assert.equal((await server.read()).result.content[0].text, 'hi');
  server.stop();
});

test('asks before it confirms, and says no when the client cannot ask', async () => {
  const server = start();
  server.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { capabilities: { elicitation: {} } } });
  await server.read();
  server.send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'confirm', arguments: { text: 'drop it' } } });
  const question = await server.read();
  assert.equal(question.method, 'elicitation/create');
  assert.match(question.params.message, /drop it/);
  server.send({ jsonrpc: '2.0', id: question.id, result: { action: 'accept', content: { confirm: true } } });
  assert.equal((await server.read()).result.content[0].text, 'confirmed');
  server.stop();

  const plain = start();
  plain.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { capabilities: {} } });
  await plain.read();
  plain.send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'confirm', arguments: { text: 'x' } } });
  assert.match((await plain.read()).result.content[0].text, /cannot ask/);
  plain.stop();
});
