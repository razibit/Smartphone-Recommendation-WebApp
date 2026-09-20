import assert from 'node:assert/strict';
import test from 'node:test';
import { requirePositiveId } from '../backend/middleware/validation';

test('accepts only positive safe integer path IDs', () => {
  assert.equal(requirePositiveId('1'), 1);
  assert.equal(requirePositiveId('9007199254740991'), Number.MAX_SAFE_INTEGER);
});

test('rejects malformed, zero, negative, and unsafe IDs', () => {
  for (const value of ['', '0', '-1', '1.5', 'abc', '9007199254740992']) {
    assert.throws(() => requirePositiveId(value), /positive integer/);
  }
});
