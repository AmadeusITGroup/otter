import {
  generateCorrelationId,
} from './utils';

describe('generateCorrelationId', () => {
  it('uses crypto.randomUUID when available', () => {
    const spy = jest.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000');
    expect(generateCorrelationId('nav-req')).toBe('00000000-0000-4000-8000-000000000000');
    spy.mockRestore();
  });

  it('falls back to a prefixed timestamp+random id when randomUUID is missing', () => {
    const original = crypto.randomUUID.bind(crypto);
    (crypto as unknown as { randomUUID?: () => string }).randomUUID = undefined;
    try {
      const id = generateCorrelationId('nav-req');
      expect(id).toMatch(/^nav-req-\d+-[a-z0-9]+$/);
    } finally {
      (crypto as unknown as { randomUUID: () => string }).randomUUID = original;
    }
  });

  it('uses the default prefix when none is provided (fallback path)', () => {
    const original = crypto.randomUUID.bind(crypto);
    (crypto as unknown as { randomUUID?: () => string }).randomUUID = undefined;
    try {
      expect(generateCorrelationId()).toMatch(/^corr-\d+-[a-z0-9]+$/);
    } finally {
      (crypto as unknown as { randomUUID: () => string }).randomUUID = original;
    }
  });

  it('produces distinct ids on successive calls', () => {
    const a = generateCorrelationId();
    const b = generateCorrelationId();
    expect(a).not.toBe(b);
  });
});
