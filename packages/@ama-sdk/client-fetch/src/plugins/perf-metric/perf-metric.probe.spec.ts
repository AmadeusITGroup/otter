import {
  PerformanceMetricPlugin,
} from './perf-metric.fetch';

let perfPlugin: PerformanceMetricPlugin;
describe('PerformanceMetricPlugin', () => {
  let onMarkOpen!: jest.Mock;

  beforeEach(() => {
    onMarkOpen = jest.fn();
    perfPlugin = new PerformanceMetricPlugin({ onMarkOpen });
  });

  it('should generate new mark ids', () => {
    expect(perfPlugin.openMark('', {})).not.toEqual(perfPlugin.openMark('', {}));
  });

  it('should include a new mark when closing', () => {
    const markId = perfPlugin.openMark('my-url', {});
    const ret = new Promise<void>((resolve) => {
      perfPlugin.onMarkComplete = (mark) => {
        expect(mark).toBeDefined();
        expect(mark.markId).toBe(markId);
        expect(mark.url).toBe('my-url');
        expect(mark.requestOptions).toEqual({});
        expect(mark.startTime).toBeDefined();
        expect(mark.response).toEqual({} as Response);
        expect(mark.error).not.toBeDefined();
        expect(mark.endTime).toBeGreaterThanOrEqual(mark.startTime);
        resolve();
      };
    });
    perfPlugin.closeMark(markId, {} as Response);
    return ret;
  });

  it('should include a new mark when closing with error', () => {
    const markId = perfPlugin.openMark('my-url', {});
    const ret = new Promise<void>((resolve) => {
      perfPlugin.onMarkError = (mark) => {
        expect(mark).toBeDefined();
        expect(mark.markId).toBe(markId);
        expect(mark.url).toBe('my-url');
        expect(mark.requestOptions).toEqual({});
        expect(mark.startTime).toBeDefined();
        expect(mark.response).not.toBeDefined();
        expect(mark.error).toEqual({} as Error);
        expect(mark.endTime).toBeGreaterThanOrEqual(mark.startTime);
        resolve();
      };
    });
    perfPlugin.closeMarkWithError(markId, {} as Error);
    return ret;
  });

  it('should include call the open mark callback', () => {
    const markId = perfPlugin.openMark('my-url', {});
    expect(onMarkOpen).toHaveBeenCalledWith(expect.objectContaining({ markId }));
  });
});
