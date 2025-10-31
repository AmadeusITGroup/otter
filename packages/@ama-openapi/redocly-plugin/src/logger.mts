import {
  EOL,
} from 'node:os';
import type {
  Logger,
} from '@ama-openapi/core';
import type {
  LocationObject,
  RuleSeverity,
} from '@redocly/openapi-core';

/** Duplicate of Problem not exposed by @redocly/openapi-core */
type Problem = {
  message: string;
  suggest?: string[];
  location?: Partial<LocationObject> | Partial<LocationObject>[];
  from?: LocationObject;
  forceSeverity?: RuleSeverity;
  ruleId?: string;
};

const noop = () => {};

/** Log levels for logger */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Create a Logger from a report function
 * @param report
 */
export const getLoggerFromReport = (report: (problem: Problem) => void): Logger => ({
  error: (...messages: any[]) => report({ forceSeverity: 'error', message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  warn: (...messages: any[]) => report({ forceSeverity: 'warn', message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  info: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  debug: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  log: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) })
});

/**
 * Get a logger with the specified log level
 * @param level
 * @param logger
 */
export const getLogger = (level?: LogLevel, logger: Logger = console) => {
  if (level) {
    switch (level) {
      case 'silent': {
        logger = { ...logger, error: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'error': {
        logger = { ...logger, warn: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'warn': {
        logger = { ...logger, info: noop };
      }
      // eslint-disable-next-line no-fallthrough -- done on purpose to disable multiple levels
      case 'info': {
        logger = { ...logger, debug: noop };
      }
    }
  }
  return logger;
};
