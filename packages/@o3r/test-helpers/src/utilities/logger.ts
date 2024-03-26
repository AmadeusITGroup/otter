/** simple Logger interface */
export interface Logger {
  /** Error message to display */
  error: (message: string) => void;
  /** Information message to display */
  info: (message: string) => void;
  /** Debug message message to display */
  debug?: (message: string) => void;
}
