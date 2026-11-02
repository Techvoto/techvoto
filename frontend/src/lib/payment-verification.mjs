/** Only an explicit backend failure is terminal; pending/unknown remains recoverable. */
export function classifyPaymentVerification(status, attempts, maxAttempts = 10) {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'failed';
  return attempts >= maxAttempts ? 'pending' : 'retry';
}
