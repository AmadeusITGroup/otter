import type {
  Logger,
} from '../../../fwk';
import {
  PluginRunner,
  type ReplyPlugin,
  type ReplyPluginContext,
} from '../../core';
import {
  DEFAULT_COMMON_OPTIONS,
  type OpenTelemetryTraceparentCommonOption,
  type OpenTelemetryTransparentReport,
} from './interfaces';

/** Option for the OpenTelemetry Traceparent Reply plugin */
export interface OpenTelemetryTraceparentReplyOption extends OpenTelemetryTraceparentCommonOption {
  /**
   * Field to be added in the SDK response (default: {@link DEFAULT_OPTIONS.dataField})
   * @default '_traceparent'
   */
  dataField: `_${string}`;
}

const DEFAULT_OPTIONS = {
  ...DEFAULT_COMMON_OPTIONS,
  dataField: '_traceparent'
} as const satisfies OpenTelemetryTraceparentReplyOption;

const TRACE_ID_LENGTH = 32;
const PARENT_ID_LENGTH = 16;

const TRACE_ID_REGEXP = new RegExp(`^[a-f0-9]{${TRACE_ID_LENGTH}}$`);
const PARENT_ID_REGEXP = new RegExp(`^[a-f0-9]{${PARENT_ID_LENGTH}}$`);

/**
 * Decode and validate a Traceparent Header.
 * Return undefined if invalid
 * @param traceparent content of the header
 * @param options additional options for the function
 * @param options.logger
 */
export const decodeTraceparentHeader = (traceparent: string, options?: { logger?: Logger }) => {
  const content = traceparent.split('-');
  const dataField: Partial<OpenTelemetryTransparentReport> = {};
  const logWarning = () => options?.logger?.warn(`Invalid traceparent header ${traceparent}, will be ignored`);

  if (content.length < 2) {
    logWarning();
    return;
  }

  if (content[0].length < PARENT_ID_LENGTH) {
    [dataField.version, dataField.traceId, dataField.parentId, dataField.traceFlags] = content;
  } else {
    [dataField.traceId, dataField.parentId, dataField.traceFlags] = content;
    dataField.version = '00';
  }

  if (!PARENT_ID_REGEXP.test(dataField.parentId) || !TRACE_ID_REGEXP.test(dataField.traceId)) {
    logWarning();
    return;
  }

  return dataField as OpenTelemetryTransparentReport;
};

/**
 * Plugin to retrieve the {@link https://www.w3.org/TR/trace-context/#traceparent-header | Traceparent header} information for the
 * {@link https://opentelemetry.io/ | OpenTelemetry} and burn them into the API response object.
 */
export class OpenTelemetryTraceparentReply<V = { [key: string]: any } | undefined> implements ReplyPlugin<V, V> {
  protected readonly options: Readonly<OpenTelemetryTraceparentReplyOption>;

  constructor(options?: Partial<OpenTelemetryTraceparentReplyOption>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
  }

  private updateParentId(parentId: string | undefined, logger?: Logger) {
    if (parentId) {
      const currentParentId = this.options.storage.getItem(this.options.parentIdStorageKey);
      if (!currentParentId || currentParentId !== parentId) {
        logger?.info?.(`The current Traceparent ParentId ${currentParentId} will be replaced by the received one ${parentId}.`);
        this.options.storage.setItem(this.options.parentIdStorageKey, parentId);
      }
    }
  }

  private decodeTraceparentHeader(traceparent: string, logger?: Logger) {
    const dataField = decodeTraceparentHeader(traceparent, { logger });
    if (dataField) {
      this.updateParentId(dataField.parentId, logger);
    }

    return dataField;
  }

  /** @inheritdoc */
  public load<K>(context: ReplyPluginContext<K>): PluginRunner<V, V> {
    return {
      transform: (data: V) => {
        if (!context.response) {
          return data;
        }

        const content = context.response.headers.get(this.options.traceparentHeader);
        if (!content) {
          context.logger?.debug?.(`The reply of the request ${context.url} does not contain ${this.options.traceparentHeader} header, the open telemetry information will not be retrieved.`);
          return data;
        }

        const dataField = this.decodeTraceparentHeader(content, context.logger);
        const extendedData = { [this.options.dataField]: dataField } as V;

        if (typeof data === 'object' && data && this.options.dataField in data) {
          context.logger?.warn(`The field "${this.options.dataField}" already exist in the response, it will be overridden by the traceparent information.`);
        }
        return data ? Object.assign(data, extendedData) : extendedData;
      }
    };
  }
}
