/** Interface extending Window with Otter Devtools accessor */
export interface WindowWithDevtools extends Window {
  /** Otter Devtools accessor */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _OTTER_DEVTOOLS_?: Record<string, any>;
}

/** Common option used by the different DevKit services */
export interface DevtoolsCommonOptions {
  /**
   * Activated on the application bootstrap
   * @default false
   */
  isActivatedOnBootstrap: boolean;
}

/** Common option used by the different Contextualization DevKit services */
export interface ContextualizationDevtoolsCommonOptions {
  /**
   * Activated on the application bootstrap when integrated in CMS context
   * @default true
   */
  isActivatedOnBootstrapWhenCMSContext: boolean;
}

/**
 * Dataset injected on the page when in CMS context
 */
export interface ContextualizationDataset {
  /** `"true"` when in CMS context */
  cmscontext?: string;
}

/** Interface describing an Otter Devtools service */
export interface DevtoolsServiceInterface {
  /** Activate the devtools service */
  activate(): void;
}
