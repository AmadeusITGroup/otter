import { SwaggerSpec } from '../swagger-spec-wrappers/swagger-spec.interface';

/** Checker Error */
export interface CheckerError {
  /** Message of the error */
  message: string;
  /** Details of the error */
  details?: string[];
  /** Swagger Spec Node reference */
  swaggerNode?: any;
}

/** List of errors reported by the checker */
export type Report = CheckerError[];

/** Checker to applied a swagger spec */
export interface Checker {
  /**
   * Check the Swagger specification in input
   * @param swaggerSpec Swagger specification
   */
  check(swaggerSpec: SwaggerSpec): Promise<Report | undefined>;
}
