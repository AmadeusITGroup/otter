/**
 * Rule Engine operator
 */
export interface Operator<L = unknown, R = unknown> {
  /** Operator name to use in condition */
  name: string;
  /** Priority in the dropdown display */
  orderingWeight? : number;
  /** Left Hand Value validator function */
  validateLhs?: (operand: L) => boolean;
  /** Right Hand Value validator function */
  validateRhs?: (operand: R) => boolean;
  /** Evaluate the values */
  evaluator: (lhs: L, rhs: R) => boolean;
}

/**
 * Rule Engine unary operator
 */
export interface UnaryOperator<L = unknown> {
  /** Operator name to use in condition */
  name: string;
  /** Left Hand Value validator function */
  validateLhs?: (operand: L) => boolean;
  /** Evaluate the values */
  evaluator: (lhs: L) => boolean;
}

/**
 * Alias for supported simple types in AEM to be used in the operators to avoid repetition of the
 * (string | boolean | Date | number)
 * This type reference is specifically handled by the rule operator extractor.
 */
export type SupportedSimpleTypes = string | boolean | Date | number;
