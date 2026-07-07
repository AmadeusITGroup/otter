/**
 * Interface reporting the decoded {@link https://www.w3.org/TR/trace-context/#traceparent-header | Traceparent header} information for the
 * {@link https://opentelemetry.io/ | OpenTelemetry} specification.
 */
export interface OpenTelemetryTransparentReport {
  /** {@link https://www.w3.org/TR/trace-context/#parent-id} */
  parentId: string;
  /** {@link https://www.w3.org/TR/trace-context/#trace-id} */
  traceId: string;
  /** {@link https://www.w3.org/TR/trace-context/#version} */
  version: string;
  /** {@link https://www.w3.org/TR/trace-context/#trace-flags} */
  traceFlags?: string;
}

/** Option for both Reply and Request plugins */
export interface OpenTelemetryTraceparentCommonOption {
  /**
   * Storage to store Parent Id (default: {@link DEFAULT_COMMON_OPTIONS.storage})
   * @default sessionStorage
   */
  storage: Storage;
  /**
   * Key of the Parent Id token in the storage (default: {@link DEFAULT_COMMON_OPTIONS.parentIdStorageKey})
   * @default 'traceparent-parent-id'
   */
  parentIdStorageKey: string;
  /**
   * Name of the traceparent header in the call (default: {@link DEFAULT_COMMON_OPTIONS.traceparentHeader})
   * @default 'traceparent'
   */
  traceparentHeader: string;
}

export const DEFAULT_COMMON_OPTIONS = {
  storage: globalThis.sessionStorage,
  parentIdStorageKey: 'traceparent-parent-id',
  traceparentHeader: 'traceparent'
} as const satisfies OpenTelemetryTraceparentCommonOption;
