import {
  existsSync,
  readFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  getEnvironmentInfo,
} from '../environment';
import {
  sendData as defaultSendData,
  type GenAICapabilityCall,
  type GenAIMetricData,
  type GenAIMetricsEvent,
  type SendDataFn,
} from '../sender';

/** Simple Logger interface */
interface Logger {
  /** Error message to display */
  error?: (message: string) => void;
  /** Error message to display */
  warn?: (message: string) => void;
  /** Information message to display */
  info?: (message: string) => void;
  /** Debug message message to display */
  debug?: (message: string) => void;
}

/** Custom options for the wrapper */
interface WrapperOptions {
  /** Logger */
  logger?: Logger;
  /** Function to send the data to the server */
  sendData?: SendDataFn;
  /** Path to the workspace */
  workspacePath?: string;
}

function sendMetricsIfAuthorized(data: GenAIMetricData, logger: Logger, sendData: SendDataFn, workspacePath = process.cwd(), error?: any) {
  logger.debug?.(JSON.stringify(data, null, 2));
  const packageJsonPath = path.join(workspacePath, 'package.json');
  const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, 'utf8')) : {};
  const shouldSendData = !!(
    ((process.env.O3R_METRICS || '').length > 0 ? process.env.O3R_METRICS !== 'false' : undefined)
    ?? packageJson.config?.o3r?.telemetry
  );
  if (shouldSendData) {
    if (typeof process.env.O3R_METRICS === 'undefined') {
      logger.info?.(
        'Telemetry is globally activated for the project (`config.o3r.telemetry` in package.json). '
        + 'If you personally don\'t want to send telemetry, you can deactivate it by setting `O3R_METRICS` to false in your environment variables, '
      );
    }
    void sendData(data, logger).catch((e) => {
      // Do not throw error if we don't manage to collect data
      const err = (e instanceof Error ? e : new Error(error));
      logger.error?.(err.stack || err.toString());
    });
  }
}

/**
 * Wrapper for genAI callback function with metrics
 * @param fn
 * @param name
 * @param kind
 * @param options
 */
export function createGenAICallbackWithMetrics<T extends (...args: any[]) => any>(fn: T, name: string, kind: GenAICapabilityCall, options?: WrapperOptions) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const logger: Logger = options?.logger ?? console;
    const sendData = options?.sendData ?? defaultSendData;
    const startTime = Math.floor(performance.now());
    let error: any;
    try {
      const result = await fn(...args);
      return result;
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(e.toString());
      error = err.stack || err.toString();
      throw err;
    } finally {
      const endTime = Math.floor(performance.now());
      const duration = endTime - startTime;
      logger.info?.(`${name} run in ${duration}ms`);
      const environment = await getEnvironmentInfo();
      const data = {
        environment,
        duration,
        genAI: {
          name,
          kind
        },
        error
      } as const satisfies GenAIMetricData;
      sendMetricsIfAuthorized(data, logger, sendData, options?.workspacePath, error);
    }
  };
}

/**
 * Sends event metrics for GenAI features if the user has authorized telemetry collection.
 * This function should be called when initializing GenAI-related features to track usage statistics.
 * @param name
 * @param event
 * @param options
 * @param error
 */
export async function sendGenAIEventMetricsIfAuthorized(name: string, event: Exclude<GenAIMetricsEvent, GenAICapabilityCall>, options?: WrapperOptions, error?: any) {
  const logger: Logger = options?.logger ?? console;
  const sendData = options?.sendData ?? defaultSendData;
  const environment = await getEnvironmentInfo();
  const data = {
    environment,
    duration: 0,
    genAI: {
      name,
      kind: event
    },
    error
  } as const satisfies GenAIMetricData;
  sendMetricsIfAuthorized(data, logger, sendData, options?.workspacePath, error);
}
