/**
 * If setImmediate not available, fallback to setTimeout
 */
globalThis.setImmediate ||= ((fn: any, ...args: any) => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const ref = globalThis.setTimeout(fn, 0, ...args);
  void jest.runOnlyPendingTimersAsync();
  return ref;
}) as any;

/**
 * If clearImmediate not available, fallback to clearTimeout
 */
globalThis.clearImmediate ||= globalThis.clearTimeout as any;
