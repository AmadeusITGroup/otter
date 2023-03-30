import { CpuInfo } from 'node:os';
import type { Logger } from '@o3r/core';

/** Map of timings */
export type Timing = { [key: string]: number[] };

/** Information relative to the CPU status of the computer */
export interface CpuStats {
  /** Core information */
  coresData: CpuInfo[];
  /** Total memory usage */
  totalMemory: number;
  /** Fee Memory */
  freeMemory: number;
  /** Percentage of free Memory */
  percentageFree: number;
}

/** Structure of a report information */
export interface ReportData {
  /** Time of the compilation in MS */
  compileTime: number;
  /** Type of the measured build */
  buildType: 'watch' | 'full';
  /** Execution time per loaders in MS */
  loadersAndCompilation: Timing;
  /** Execution time per plugin in MS */
  pluginTiming: Record<string, number>;
  /** CPU information */
  cpuStats: CpuStats;
  /** Computer host name  */
  hostName: string;
  /** Name of the application currently run */
  appName: string;
  /** Session ID to identify the current run */
  sessionId: string;
}

/**
 * The interface to report build stats
 * The report method is given the build stats data as a parameter
 */
export interface Reporter extends Logger {
  /** Report the build metrics */
  log(buildData: ReportData): void;
}
