import { EnvironmentMetricData } from '../environment';


export interface BaseMetricData {
  /** Environment information */
  environment: EnvironmentMetricData;
  /** Time it takes to run */
  duration: number;
  /** Error message */
  error?: string;
}
export interface BuilderMetricData extends BaseMetricData {
  /** Builder information */
  builder: {
    /** Builder name */
    name: string;
    /** Builder options */
    options?: any;
    /** Target information */
    target?: {
      /** Target name */
      name: string;
      /** Target project name */
      projectName: string;
      /** Target configuration name */
      configuration?: string;
    };
  };
}

export interface SchematicMetricData extends BaseMetricData {
  /** Schematic information */
  schematic: {
    /** Schematic name format @pkg/name:schematic-name */
    name: string;
    /** Schematic options */
    options?: any;
    /** Is run in an interactive context */
    interactive: boolean;
  };
}

/**
 * Different kinds of metrics
 */
export type MetricData = BuilderMetricData | SchematicMetricData;

/**
 * Function sending metrics to the server
 * @param data Metrics to report
 * @param logger Optional logger to provide to the function
 */
export type SendDataFn = (data: MetricData, logger?: { error: (msg: string) => void } | undefined) => Promise<void>;

/**
 * Send metric to a Amadeus Log Server
 * @param data Metrics to report
 * @param logger Optional logger to provide to the function
 */
export const sendData: SendDataFn = (data, logger) => {
  let body!: string;
  try {
    const message = JSON.stringify(data);
    body = JSON.stringify({
      messages: [{
        applicationName: 'OTTER',
        message
      }]
    });
  } catch (e: any) {
    return Promise.reject(e);
  }

  setTimeout(() => {
    void fetch('https://uat.digital-logging.saas.amadeus.com/postUILogs', {
      method: 'POST',
      body
    }).catch((e) => {
      const err = (e instanceof Error ? e : new Error(e));
      logger?.error(err.stack || err.toString());
    });
  }, 1).unref();

  return Promise.resolve();
};

