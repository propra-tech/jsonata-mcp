import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import jsonata from 'jsonata';
import { z } from 'zod';

const jsonataErrorSchema = z.object({ message: z.string(), value: z.any().optional(), position: z.number(), token: z.string() });

const safeJson = (value: string) => {
  try {
    const obj = JSON.parse(value || '{}');
    return [obj, null] as const;
  } catch (error) {
    return [null, error as Error] as const;
  }
};

const safeJsonata = (value: string) => {
  try {
    const expr = jsonata(value);
    return [expr, null] as const;
  } catch (error) {
    const jsonataError = jsonataErrorSchema.safeParse(error);
    const parsedError = jsonataError.success ? jsonataError.data : (error as Error);
    return [null, parsedError] as const;
  }
};

export const evaluateSchema = {
  data: z.string().optional().default('{}'),
  expression: z.string(),
  bindings: z.string().optional().default('{}'),
};

export const evaluate: ToolCallback<typeof evaluateSchema> = async ({ data, expression, bindings }) => {
  const [jsonataExpression, expressionError] = safeJsonata(expression);
  if (expressionError) {
    const text = `JSONata expression error: ${JSON.stringify(expressionError)}`;

    return { content: [{ type: 'text', text }] };
  }

  const [dataObject, dataError] = safeJson(data);
  if (dataError) {
    const text = `Data JSON error: ${JSON.stringify(dataError)}`;

    return { content: [{ type: 'text', text }] };
  }

  const [bindingsObject, bindingsError] = safeJson(bindings);
  if (bindingsError) {
    const text = `Bindings JSON error: ${JSON.stringify(bindingsError)}`;

    return { content: [{ type: 'text', text }] };
  }

  try {
    const result = await jsonataExpression.evaluate(dataObject, bindingsObject);
    const text = result === null || result === undefined ? 'null or undefined' : JSON.stringify(result);

    return { content: [{ type: 'text', text }] };
  } catch (error) {
    const jsonataError = jsonataErrorSchema.safeParse(error);
    const parsedError = JSON.stringify(jsonataError.success ? jsonataError.data : error);
    const text = `Evaluation error: ${parsedError}`;

    return { content: [{ type: 'text', text }] };
  }
};
