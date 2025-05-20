# @propra/jsonata-mcp

[![npm version](https://img.shields.io/npm/v/@propra/jsonata-mcp.svg)](https://www.npmjs.com/package/@propra/jsonata-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) implementation for [JSONata](https://jsonata.org/), providing powerful JSON transformation capabilities via MCP.

## Overview

This package provides a JSONata implementation for the Model Context Protocol (MCP), allowing you to execute JSONata expressions against JSON data through an MCP-compatible interface. Use it to transform, query, and manipulate JSON data within MCP-enabled environments.

JSONata is a lightweight query and transformation language for JSON data, offering powerful capabilities similar to XPath or XSLT but designed specifically for JSON.

## Features

- MCP-compatible JSONata expression evaluation
- Support for JSONata expressions with custom bindings
- Error handling for malformed expressions or input data
- Runs as a standalone MCP server process

## Requirements

- Node.js >= 22.0.0
- pnpm >= 9.2.0 (recommended package manager)

## Installation

```bash
# Using npm
npm install @propra/jsonata-mcp

# Using pnpm (recommended)
pnpm add @propra/jsonata-mcp

# Using yarn
yarn add @propra/jsonata-mcp
```

## Usage

### As an MCP Server

You can run the MCP server directly:

```bash
npx @propra/jsonata-mcp
```

This will start the JSONata MCP server that communicates via stdin/stdout following the MCP protocol.

### With Claude Code or Claude Desktop

This package integrates seamlessly with Claude Code or Claude Desktop environments that use the Model Context Protocol. Here's how to use it in your `.claude.json` or `claude_desktop_config.json` configuration:

```json
{
  "mcpServers": [
    "jsonata": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@propra/jsonata-mcp"
      ]
    }
  ]
}
```

Once configured, you can use JSONata expressions in your prompts to Claude:

```
Use the jsonata tool to filter this JSON data for books under $10:

{"books": [
  {"title": "The Great Gatsby", "price": 12.99},
  {"title": "To Kill a Mockingbird", "price": 9.99},
  {"title": "1984", "price": 7.50}
]}

Use the expression: books[price < 10]
```

Claude will execute the JSONata expression and return the filtered results.

### In MCP Client Applications

This package can be used with any MCP client. Here's a basic example of how to call the JSONata evaluation tool:

```javascript
import { McpClient } from '@modelcontextprotocol/sdk/client';

const client = new McpClient();
// Connect to the JSONata MCP server...

const response = await client.callTool('evaluate', {
  expression: 'data.books[price < 10].title',
  data: JSON.stringify({
    data: {
      books: [
        { title: "Book A", price: 5.99 },
        { title: "Book B", price: 12.99 },
        { title: "Book C", price: 7.50 }
      ]
    }
  })
});

console.log(response); // ["Book A", "Book C"]
```

## API

The package exposes a single tool:

### Tool: `evaluate`

Evaluates a JSONata expression against the provided data.

#### Parameters

- `expression` (string, required): The JSONata expression to evaluate
- `data` (string, optional): JSON string containing the data to evaluate against (defaults to `{}`)
- `bindings` (string, optional): JSON string containing variable bindings (defaults to `{}`)

#### Response

Returns a text content type with the result of the JSONata evaluation, either:
- The JSON-stringified result
- Error message if evaluation fails

## Example Expressions

```
// Get titles of books with price < 10
data.books[price < 10].title

// Calculate total price of all books
$sum(data.books.price)

// Get books by a specific author
data.books[author="Jane Doe"]

// Format names using string interpolation
data.people.{"Full name": firstName & " " & lastName}
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type checking
pnpm check-types

# Build the package
pnpm build
```

## License

ISC © Propra Technologies, Inc.

## Related Projects

- [JSONata](https://jsonata.org/) - The underlying JSON query and transformation language
- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) - Protocol specification