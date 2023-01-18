/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {Operator} from './operator.interface';

/**
 * Execute Operator
 *
 * @param lhs Left hand side
 * @param rhs Right hand side
 * @param operator Operator to compare values
 */
export function executeOperator<L = unknown, R = unknown>(lhs: L, rhs: R, operator: Operator<L, R>) {
  const validLhs = (!operator.validateLhs || operator.validateLhs(lhs));
  const validRhs = (!operator.validateRhs || operator.validateRhs(rhs));
  if (!validLhs) {
    throw new Error(`Invalid left operand : ${lhs}`);
  }
  if (!validRhs) {
    throw new Error(`Invalid right operand : ${rhs}`);
  }
  const obs = operator.evaluator(lhs, rhs);
  return obs;
}

/**
 * Validate a number operand
 *
 * @param operand value of one of the operands
 */
export function numberValidator(operand: unknown): operand is number | string {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return operand !== '' && !Array.isArray(operand) && !isNaN(+`${operand}`);
}
