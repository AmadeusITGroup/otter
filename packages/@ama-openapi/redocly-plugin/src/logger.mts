import type { Logger } from "@ama-openapi/core";
import type { LocationObject, RuleSeverity } from "@redocly/openapi-core";
import { EOL } from 'node:os';

/** Duplicate of Problem not exposed by @redocly/openapi-core */
type Problem = {
  message: string;
  suggest?: string[];
  location?: Partial<LocationObject> | Array<Partial<LocationObject>>;
  from?: LocationObject;
  forceSeverity?: RuleSeverity;
  ruleId?: string;
}

const noop = () => {};

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export const getLoggerFromReport = (report: (problem: Problem) => void): Logger => ({
  error: (...messages: any[]) => report({ forceSeverity: "error", message: messages.map((msg) => JSON.stringify(msg)).join(EOL)}),
  warn: (...messages: any[]) => report({ forceSeverity: "warn", message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  info: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  debug: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) }),
  log: (...messages: any[]) => report({ message: messages.map((msg) => JSON.stringify(msg)).join(EOL) })
});

export const getLogger = (level?: LogLevel, logger: Logger = console) => {
  if (level) {
    switch (level) {
      case 'silent':
        logger = { ...logger, error: noop }
      case 'error':
        logger = { ...logger, warn: noop }
      case 'warn':
        logger = { ...logger, info: noop }
      case 'info':
        logger = { ...logger, debug: noop }
    }
  }
  return logger;
}
