/** Interface extending Window with Otter Devtools accessor */
export interface WindowWithDevtools extends Window {
  /** Otter Devtools accessor */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _OTTER_DEVTOOLS_?: Record<string, any>;
}

/** Common option used by the different DevKit services */
export interface DevtoolsCommonOptions {
  /**
   * Activated the application bootstrap
   * @default false
   */
  isActivatedOnBootstrap: boolean;
}

/** Interface describing an Otter Devtools service */
export interface DevtoolsServiceInterface {
  /** Activate the devtools service */
  activate(): void;
}
