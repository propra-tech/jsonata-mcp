import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { evaluate, evaluateSchema } from './evaluate.ts';

const server = new McpServer({
  name: 'JSONata',
  version: '0.1.0',
});

server.tool('evaluate', evaluateSchema, evaluate);

const runServer = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

runServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
