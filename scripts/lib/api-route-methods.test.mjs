import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { exportedRouteMethods } from './api-route-methods.mjs';

test('ignores comments and strings containing legacy handlers', () => {
  assert.deepEqual(exportedRouteMethods(`export async function GET() {}
    /* export async function POST() {} */
    const example = 'export const DELETE = handler';
    // export const PATCH = handler;
  `), ['GET']);
});
test('finds functions, wrappers, aliases and reexports', () => {
  assert.deepEqual(exportedRouteMethods(`export function GET() {}
    export const POST = wrap(handler), PUT = anotherHandler;
    export { handler as DELETE };
    export { PATCH } from './handlers';
    export type { OPTIONS } from './types';
  `), ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
});
test('ignores nested namespace exports and unexported helpers', () => {
  assert.deepEqual(exportedRouteMethods(`function GET() {}
    namespace Example { export function POST() {} }
    export const { PUT } = handlers;
  `), ['PUT']);
});
