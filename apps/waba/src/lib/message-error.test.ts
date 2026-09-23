import { describe, expect, it } from 'vitest';
import { getMessageError } from './message-error';

describe('getMessageError', () => {
  it('preserves plain API errors', () => {
    expect(getMessageError('Forbidden')).toBe('Forbidden');
    expect(getMessageError(new Error('Connection failed'))).toBe('Connection failed');
  });

  it('never renders unknown objects or empty responses as message text', () => {
    for (const value of [undefined, null, {}, { error: {} }, '', []]) {
      expect(getMessageError(value, 'Please retry.')).toBe('Please retry.');
    }
  });
});
