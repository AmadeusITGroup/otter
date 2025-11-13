import {
  isFigmaFileContext,
  isFigmaProjectContext,
} from './context-helpers';

describe('isFigmaFileContext', () => {
  it('should confirm it is file context', () => {
    expect(isFigmaFileContext({ fileKey: 'test', other: true })).toBe(true);
    expect(isFigmaFileContext({ fileKey: '' })).toBe(true);
  });
  it('should confirm it is not figma file context', () => {
    expect(isFigmaFileContext({})).toBe(false);
    expect(isFigmaFileContext({ projectKey: 'test' })).toBe(false);
  });
});

describe('isFigmaProjectContext', () => {
  it('should confirm it is project context', () => {
    expect(isFigmaProjectContext({ projectKey: 'test', other: true })).toBe(true);
    expect(isFigmaProjectContext({ projectKey: '' })).toBe(true);
  });
  it('should confirm it is not figma file context', () => {
    expect(isFigmaProjectContext({})).toBe(false);
    expect(isFigmaProjectContext({ fileKey: 'test' })).toBe(false);
  });
});
