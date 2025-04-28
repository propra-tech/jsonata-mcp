import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import jsonata from 'jsonata';
import { z } from 'zod';

const server = new McpServer({
  name: 'JSONata',
  version: '0.1.0',
});

server.tool(
  'evaluate',
  { data: z.string().default('{}'), expression: z.string(), bindings: z.string().default('{}') },
  async ({ data, expression, bindings }) => {
    const jsonataExpression = jsonata(expression);
    const result = await jsonataExpression.evaluate(JSON.parse(data), JSON.parse(bindings));

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
