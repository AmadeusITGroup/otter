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
export type SendDataFn = (data: MetricData, logger?: { error: (msg: string) => void }) => Promise<void>;

/**
 * Send metric to a Amadeus Log Server
 * @param data Metrics to report
 * @param _logger Optional logger to provide to the function
 * @param _logger.error
 */
export const sendData: SendDataFn = async (data: MetricData, _logger?: { error: (msg: string) => void }) => {
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
};
