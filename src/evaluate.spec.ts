import type { RequestOptions } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { TypeOf, ZodType } from 'zod';
import { evaluate } from './evaluate.ts';

const extraMock = {
  signal: {
    aborted: false,
    onabort: null,
    reason: undefined,
    throwIfAborted: function (): void {
      throw new Error('Function not implemented.');
    },
    addEventListener: function <K extends keyof AbortSignalEventMap>(
      type: K,
      listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void {
      throw new Error('Function not implemented.');
    },
    removeEventListener: function <K extends keyof AbortSignalEventMap>(
      type: K,
      listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void {
      throw new Error('Function not implemented.');
    },
    dispatchEvent: function (event: Event): boolean {
      throw new Error('Function not implemented.');
    },
  },
  sendNotification: function (notification: ServerNotification): Promise<void> {
    throw new Error('Function not implemented.');
  },
  sendRequest: function <U extends ZodType<object>>(request: ServerRequest, resultSchema: U, options?: RequestOptions): Promise<TypeOf<U>> {
    throw new Error('Function not implemented.');
  },
};

describe('evaluate', () => {
  it('should evaluate a JSONata expression', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = '$.name';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '"Khuram"' }] });
  });

  it('should handle JSONata evaluation errors', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = `'string' + 1`;
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.match(result.content[0].text as string, /^Evaluation error:/);
  });

  it('should handle JSON parsing errors', async () => {
    const data = '{ name: Khuram, age: 30 }'; // Invalid JSON
    const expression = 'name';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.match(result.content[0].text as string, /^Data JSON error:/);
  });

  it('should return null or undefined for no result', async () => {
    const data = JSON.stringify({});
    const expression = 'name';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    const expectedResult = { content: [{ type: 'text', text: 'null or undefined' }] };
    assert.deepStrictEqual(result, expectedResult);
  });

  it('should return an error for an empty expression', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = '';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.match(result.content[0].text as string, /^JSONata expression error:/);
  });

  it('should handle undefined bindings', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = 'name';
    const bindings = '';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '"Khuram"' }] });
  });

  it('should handle invalid bindings', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = '$.name';
    const bindings = '{ invalid: "bindings" }'; // Invalid JSON

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.match(result.content[0].text as string, /^Bindings JSON error:/);
  });

  it('should handle complex JSONata expressions', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30, address: { city: 'Calgary', postal: 'T2P 0S2' } });
    const expression = 'address.city';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '"Calgary"' }] });
  });

  it('should handle JSONata functions', async () => {
    const data = JSON.stringify({ numbers: [1, 2, 3, 4, 5] });
    const expression = '$sum(numbers)';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '15' }] });
  });

  it('should handle JSONata variables', async () => {
    const data = JSON.stringify({ name: 'Khuram', age: 30 });
    const expression = '($name := name; $age := age; $name & " is " & $age & " years old")';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '"Khuram is 30 years old"' }] });
  });

  it('should handle JSONata filters', async () => {
    const data = JSON.stringify({
      people: [
        { name: 'Khuram', age: 30 },
        { name: 'Jane', age: 25 },
      ],
    });
    const expression = '[people[age > 28].name]';
    const bindings = '{}';

    const result = await evaluate({ data, expression, bindings }, extraMock);

    assert.deepStrictEqual(result, { content: [{ type: 'text', text: '["Khuram"]' }] });
  });
});
