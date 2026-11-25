#!/usr/bin/env node
// A minimal MCP server over stdio, with no dependencies: a template and a test server for Mercurius.
// Two tools: echo (read only) and confirm, which asks the client to confirm before it answers (elicitation).
'use strict';

const readline = require('node:readline');

const PROTOCOL = '2025-06-18';
const TOOLS = [
  {
    name: 'echo',
    description: 'Returns the text it was given.',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'confirm',
    description: 'Asks the user to confirm, then returns the text with the answer.',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
];

function send(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

function result(id, value) {
  send({ jsonrpc: '2.0', id, result: value });
}

function text(id, value) {
  result(id, { content: [{ type: 'text', text: value }] });
}

let canAsk = false;
let next = 1000;
const asked = new Map();

function call(message) {
  const name = message.params && message.params.name;
  const args = (message.params && message.params.arguments) || {};
  const value = typeof args.text === 'string' ? args.text : '';
  if (name === 'echo') {
    return text(message.id, value);
  }
  if (name === 'confirm') {
    if (!canAsk) {
      return text(message.id, 'not confirmed: the client cannot ask');
    }
    const id = ++next;
    asked.set(id, message.id);
    return send({
      jsonrpc: '2.0',
      id,
      method: 'elicitation/create',
      params: {
        message: 'Confirm: ' + value,
        requestedSchema: { type: 'object', properties: { confirm: { type: 'boolean', title: 'Confirm?' } } },
      },
    });
  }
  send({ jsonrpc: '2.0', id: message.id, error: { code: -32602, message: 'Unknown tool' } });
}

function handle(message) {
  if (message.method === undefined) {
    // an answer of the client to a question of the server
    const callId = asked.get(message.id);
    if (callId !== undefined) {
      asked.delete(message.id);
      const action = message.result ? message.result.action : 'error';
      text(callId, action === 'accept' ? 'confirmed' : 'not confirmed: ' + action);
    }
    return;
  }
  switch (message.method) {
    case 'initialize':
      canAsk = Boolean(message.params && message.params.capabilities && message.params.capabilities.elicitation);
      return result(message.id, { protocolVersion: PROTOCOL, capabilities: { tools: {} }, serverInfo: { name: 'mercurius-mcp-template', version: '1.0.0' } });
    case 'tools/list':
      return result(message.id, { tools: TOOLS });
    case 'tools/call':
      return call(message);
    case 'ping':
      return result(message.id, {});
    default:
      if (message.id !== undefined) {
        send({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: 'Method not found' } });
      }
  }
}

readline.createInterface({ input: process.stdin }).on('line', (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }
  if (message && typeof message === 'object') {
    handle(message);
  }
});
