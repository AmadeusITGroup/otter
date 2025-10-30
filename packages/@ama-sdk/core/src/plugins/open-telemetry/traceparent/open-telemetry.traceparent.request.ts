import {
  v4,
} from 'uuid';
import {
  PluginRunner,
  RequestOptions,
  RequestPlugin,
  RequestPluginContext,
} from '../../core';
import {
  DEFAULT_COMMON_OPTIONS,
  type OpenTelemetryTraceparentCommonOption,
} from './interfaces';

/** Option for the OpenTelemetry Traceparent Request plugin */
export interface OpenTelemetryTraceparentRequestOption extends OpenTelemetryTraceparentCommonOption {
  /**
   * Enable the generation of the {@link https://www.w3.org/TR/trace-context/#trace-id | Trace ID}, based on {@link v4 | uuid.v4()} function, on every call.
   * @default true
   */
  generateTraceId: boolean;

  /**
   * {@link https://www.w3.org/TR/trace-context/#version | version} of the traceparent header
   * @default 0
   */
  version: number;

  /** Value of function returning the value of the {@link https://www.w3.org/TR/trace-context/#trace-flags | Trace Flags} information */
  traceFlags?: string | (() => string);
}

const DEFAULT_OPTIONS = {
  ...DEFAULT_COMMON_OPTIONS,
  generateTraceId: true,
  version: 0
} as const satisfies OpenTelemetryTraceparentRequestOption;

/**
 * Plugin to apply {@link https://www.w3.org/TR/trace-context/#traceparent-header | Traceparent header} to the requests
 * The {@link https://www.w3.org/TR/trace-context/#trace-id | Trace ID} and {@link https://www.w3.org/TR/trace-context/#parent-id | Parent ID} are calculated based on {@link v4 | uuid.v4()} algorithm.
 */
export class OpenTelemetryTraceparentRequest implements RequestPlugin {
  /**
   * Option of the Plugin
   */
  protected readonly options: Readonly<OpenTelemetryTraceparentRequestOption>;

  /**
   * The parent ID used to track API calls
   */
  public get parentId() {
    const parentId = this.options.storage.getItem(this.options.parentIdStorageKey) || undefined;
    if (parentId) {
      return parentId;
    } else {
      const id = this.generateParentId();
      this.options.storage.setItem(this.options.parentIdStorageKey, id);
      return id;
    }
  }

  constructor(options?: Partial<OpenTelemetryTraceparentRequestOption>) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options
    };
  }

  /** @inheritdoc */
  public load(_context?: RequestPluginContext): PluginRunner<RequestOptions, RequestOptions> {
    const parentId = this.parentId;
    const getTraceFlag = typeof this.options.traceFlags === 'function' ? this.options.traceFlags : () => (this.options.traceFlags as string) || '';
    return {
      transform: (data: RequestOptions) => {
        const version = this.options.version > 0 ? `${this.options.version.toString(16).toLowerCase().padStart(2, '0')}-` : '';
        const traceId = this.options.generateTraceId ? this.generateTraceId() : '0'.repeat(32);
        const content = `${version}${traceId}-${parentId}-${getTraceFlag().padStart(2, '0')}`.toLowerCase();
        data.headers.append(this.options.traceparentHeader, content);
        return data;
      }
    };
  }

  /** Generate a Parent Id */
  public generateParentId() {
    return v4().replaceAll('-', '').slice(0, 16);
  }

  /** Generate a Trace Id */
  public generateTraceId() {
    return v4().replaceAll('-', '');
  }
}
