import type {
  Facts,
} from '../fact/fact.interfaces';

/**
 * Rule Engine operator
 */
export interface Operator<LeftExposed = unknown, RightExposed = unknown, LeftSupported = LeftExposed, RightSupported = RightExposed> {
  /** Operator name to use in condition */
  name: string;
  /** Priority in the dropdown display */
  orderingWeight?: number;
  /** Left Hand Value validator function */
  validateLhs?: unknown extends LeftSupported ? (operand: unknown) => boolean : (operand: unknown) => operand is LeftSupported;
  /** Right Hand Value validator function */
  validateRhs?: unknown extends RightSupported ? (operand: unknown) => boolean : (operand: unknown) => operand is RightSupported;
  /** Evaluate the values */
  evaluator: (lhs: LeftSupported, rhs: RightSupported, operatorFactValues?: Record<string, Facts>) => boolean;
  /** List of facts names that the operator can depend on */
  factImplicitDependencies?: string[];
}

/**
 * Rule Engine unary operator
 */
export interface UnaryOperator<L = unknown> {
  /** Operator name to use in condition */
  name: string;
  /** Left Hand Value validator function */
  validateLhs?: unknown extends L ? (operand: unknown) => boolean : (operand: unknown) => operand is L;
  /** Evaluate the values */
  evaluator: (lhs: L) => boolean;
}

/**
 * Alias for supported simple types in AEM to be used in the operators to avoid repetition of the
 * (string | boolean | Date | number)
 * This type reference is specifically handled by the rule operator extractor.
 */
export type SupportedSimpleTypes = string | boolean | Date | number | null | undefined;

/**
 * Any input that can be used as single parameter for Date constructor (Date, string, number)
 */
export type DateInput = Date | string | number;
