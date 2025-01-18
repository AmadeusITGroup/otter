import type {
  AnalyticsEventReporter,
} from '../services/tracker';
import {
  AnalyticsExceptionLogger,
} from './logger.analytics';

describe('Logger Analytics service', () => {
  let logger!: AnalyticsExceptionLogger;
  let reporter!: AnalyticsEventReporter;

  beforeEach(() => {
    reporter = { reportEvent: jest.fn() } as any;
    logger = new AnalyticsExceptionLogger(reporter);
  });

  it('should emit warning to reporter', () => {
    const message = 'my error';
    logger.warn(message);
    expect(reporter.reportEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event',
      action: 'exception',
      description: message,
      fatal: false
    }));
  });

  it('should emit error to reporter', () => {
    const message = 'my error';
    logger.error(message);
    expect(reporter.reportEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event',
      action: 'exception',
      description: message,
      fatal: true
    }));
  });

  it('should ignore other messages', () => {
    const message = 'my error';
    logger.debug(message);
    logger.log(message);
    logger.info(message);
    expect(reporter.reportEvent).not.toHaveBeenCalled();
  });
});
