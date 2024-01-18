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
 * Send metric to a server
 * @param data
 * @param logger
 */
export const sendData = async (data: MetricData, logger?: { error: (msg: string) => void }) => {
  try {
    const message = JSON.stringify(data);
    const body = JSON.stringify({
      messages: [{
        applicationName: 'OTTER',
        message
      }]
    });
    await fetch('https://uat.digital-logging.saas.amadeus.com/postUILogs', {
      method: 'POST',
      body
    });
  } catch (e: any) {
    // Do not throw error if we don't manage to send data to a server
    const err = e instanceof Error ? e : new Error(e);
    // eslint-disable-next-line no-console
    (logger || console).error(err.stack || err.toString());
  }
};
