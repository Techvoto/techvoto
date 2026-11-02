import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPaymentVerification } from '../src/lib/payment-verification.mjs';

test('only explicit provider success is terminal success', () => {
  assert.equal(classifyPaymentVerification('success', 1), 'success');
});

test('only explicit provider failure is terminal failure', () => {
  assert.equal(classifyPaymentVerification('failed', 1), 'failed');
});

test('pending and unknown provider states keep polling before the retry limit', () => {
  for (const status of ['pending', 'refund_pending', 'unknown', null, undefined]) {
    assert.equal(classifyPaymentVerification(status, 9, 10), 'retry');
  }
});

test('retry exhaustion becomes recoverable pending, never a false payment failure', () => {
  for (const status of ['pending', 'unknown', null, undefined]) {
    assert.equal(classifyPaymentVerification(status, 10, 10), 'pending');
  }
});
