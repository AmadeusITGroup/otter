import type { Logger } from 'loglevel';
import { Arguments, Argv } from 'yargs';
import { CommonOptions, yargsAmaCli } from './common-config';

/** Progress bar update options */
export interface ProgressBarUpdate {
  /** Label to display on the progress bar */
  label?: string;

  /** Force value of the progress bar */
  value?: number;
}

/** Progress bar interface */
export interface ProgressBar {
  /**
   * Increment progress
   *
   * @param update Update the display of the progress bar
   */
  tick: (update?: ProgressBarUpdate) => void;

  /** Complete the progress bar */
  complete: () => void;
}

/** Current task display */
export interface Task {
  /**
   * Update the task label
   *
   * @param label Label to display
   */
  start: () => void;

  /**
   * Update the task label
   *
   * @param label Label to display
   */
  updateLabel: (label: string) => void;

  /**
   * Set the task as success
   *
   * @param label Label to display
   */
  succeed: (label?: string) => void;

  /**
   * Set the task as failure
   *
   * @param label Label to display
   */
  fail: (label?: string) => void;

  /**
   * Bind task to promise
   *
   * @param promise Promise to bind to
   * @param label Label to display
   */
  fromPromise: <T>(promise: PromiseLike<T>, successLabel?: string, failureLabel?: string) => PromiseLike<T>;
}

/** Context of a module to dialog with CLI host */
export interface Context {
  /**
   * Progress bar helper
   *
   * @param total Total value of the progress bar
   * @param initialLabel  Label to be displayed initially on the progressBar
   */
  getProgressBar: (total: number, initialLabel?: string) => ProgressBar;

  /**
   * Retrieve an install of the spinner to be used in the Amaterasu module
   *
   * @param initialLabel Label to be displayed initially on the spinner
   */
  getSpinner: (initialLabel?: string) => Task;

  /** logger */
  logger: Logger;
}

/** Root Context provided to modules */
export interface RootContext extends Context {

  /**
   * Show Help message
   *
   * @param amaYargs instance of current Yarg
   * @param arg Argument of the command
   */
  showHelpMessage: (amaYargs: Argv, arg: Arguments) => void | Promise<void>;

  /**
   * Generate a formatted usage message
   *
   * @param moduleName Nome of the module
   * @param command CLI Command
   * @param longDescription Long description of the command to add additional information
   * @param cmdParameters Parameters of the command
   * @param baseCommand Argument of the cli
   */
  generateUsageMessage: (moduleName: string, command?: string, longDescription?: string, cmdParameters?: string, baseCommand?: string) => string;

  /**
   * Retrieve context tools based on executed rule
   *
   * @param commonOptions Value of the common options
   * @param totalProgress total number of steps for teh command
   */
  getContext: (commonOptions: CommonOptions) => Context;
}

export interface AmaCliModule {
  /**
   * Initialization the module and export yargs instance
   *
   * @param yargsAma Global CLI configuration
   * @param context Factory to retrieve context to the executed command
   */
  init: <T extends typeof yargsAmaCli, S extends T>(yargsAma: T, context: RootContext) => S;
}
