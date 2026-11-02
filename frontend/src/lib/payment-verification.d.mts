export function classifyPaymentVerification(
  status: string | null | undefined,
  attempts: number,
  maxAttempts?: number,
): 'success' | 'failed' | 'pending' | 'retry';
