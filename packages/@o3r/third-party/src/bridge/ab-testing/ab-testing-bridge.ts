import {
  BehaviorSubject, distinctUntilChanged, Observable
} from 'rxjs';
import type {Logger} from '@o3r/core';

/**
 * Shared interface with the A/B testing provider
 */
export interface AbTestBridgeInterface<T> {
  /**
   * Start an AB testing experiment
   */
  start(experiments: T | T[]): void;
  /**
   * Stop an AB testing experiment
   */
  stop(experiments?: T | T[]): void;
}

/**
 * Configure the A/B testing script interfaces with the application
 */
export interface AbTestBridgeConfig {
  /**
   * Reference to communicate with the bridge from the window
   * @default 'abTestBridge'
   */
  bridgeName: string;
  /**
   * Debug logger
   * @default console
   */
  logger: Logger;
  /**
   * Event a third party can subscribe to before starting the communication with the bridge
   * @default 'ab-test-ready'
   */
  readyEventName: string;
}

/**
 * Default options that will represent the interface
 */
const defaultOptions: AbTestBridgeConfig = {
  bridgeName: 'abTestBridge',
  readyEventName: 'ab-test-ready',
  logger: console
};

/**
 * Bridge between the application and a third party A/B testing provider.
 * Exposes a start and stop methods to allow the external script to set the list of experiments to run over the
 * application.
 *
 * Share the resulting list of experiments with the rest of the application via an observable.
 */
export class AbTestBridge<T> implements AbTestBridgeInterface<T> {
  /**
   * Behaviour subject to control the experiments via the exposed interface
   */
  private readonly experimentSubject$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
  /**
   * Options to configure the communication between the AB Testing bridge and third parties
   */
  private readonly options: AbTestBridgeConfig;
  /**
   * Observable with the list of AB testing experiments currently applied
   */
  public experiments$: Observable<T[]>;

  /**
   * @param isExperimentEqual check two different experiments match to identify an experiment to start or to stop
   * @param options configure the communication with the A/B testing third party provider
   */
  constructor(private readonly isExperimentEqual: (value1?: T, value2?: T) => boolean, options?: Partial<AbTestBridgeConfig>) {
    this.experiments$ = this.experimentSubject$.pipe(
      distinctUntilChanged((experimentsA: T[], experimentsB: T[]) =>
        experimentsB.length === experimentsA.length && experimentsA.every((eA) => experimentsB.find((eB) => isExperimentEqual(eA, eB))
        ))
    );
    this.options = {
      ...defaultOptions,
      ...options
    };
    if ((window as any)[this.options.bridgeName]) {
      this.log(`An instance of ${this.options.bridgeName} already exists. This AbTestBridge instance will be ignored`);
    } else {

      (window as any)[this.options.bridgeName] = {start: this.start.bind(this), stop: this.stop.bind(this)};
    }
    document.dispatchEvent(new CustomEvent(this.options.readyEventName));
  }

  /**
   * Use configured logger to log AB testing related information
   * @param args
   */
  private log(...args: any[]) {
    (this.options.logger.debug || this.options.logger.log)('A/B Test', ...args);
  }

  /**
   * @inheritDoc
   */
  public start(experiments: T | T[]) {
    this.log('Start experiment', experiments);
    const currentProfile = this.experimentSubject$.getValue();
    this.experimentSubject$.next([
      ...currentProfile,
      ...(Array.isArray(experiments) ? experiments : [experiments]).filter((exp) =>
        !currentProfile.find((expB: T) => this.isExperimentEqual(exp, expB)))
    ]);
  }

  /**
   * @inheritDoc
   */
  public stop(experiments?: T | T[]) {
    this.log('Stop experiment', experiments);
    const currentExperiments = this.experimentSubject$.getValue();
    if (experiments) {
      // Stop the mentioned experiment
      this.experimentSubject$.next(currentExperiments.filter((expB: T) => !(Array.isArray(experiments) ? experiments : [experiments]).some((expA) => this.isExperimentEqual(expB, expA)))
      );
    } else {
      // Stop all the experiment
      this.experimentSubject$.next([]);
    }
  }
}
