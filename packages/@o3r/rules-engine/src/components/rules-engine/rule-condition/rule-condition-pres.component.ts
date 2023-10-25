import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import type {
  BinaryOperation,
  GenericOperand,
  OperandFact,
  TopLevelCondition,
  UnaryOperation
} from '../../../engine';

@Component({
  selector: 'o3r-rule-condition-pres',
  styleUrls: ['./rule-condition-pres.style.scss'],
  templateUrl: './rule-condition-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RuleConditionPresComponent {

  private _condition?: TopLevelCondition;

  /**
   * Left hand operator as it will be displayed in the template.
   * In the case of a fact with a json path, will resolve the whole fact path, else will only display the value
   */
  public lhs = 'undefined';

  /**
   * Right hand operator as it will be displayed in the template.
   * In the case of a fact with a json path, will resolve the whole fact path, else will only display the value
   */
  public rhs: string | undefined;

  /**
   * Rule condition that will be flattened by the component setter
   */
  @Input()
  public set condition(condition: TopLevelCondition | undefined) {
    this._condition = condition;
    this.lhs = (condition as UnaryOperation | BinaryOperation)?.lhs ? this.getOperandName((condition as UnaryOperation | BinaryOperation).lhs) : 'undefined';
    this.rhs = (condition as BinaryOperation)?.rhs ? this.getOperandName((condition as BinaryOperation).rhs) : undefined;
  }

  public get condition(): TopLevelCondition | undefined {
    return this._condition;
  }

  private getOperandName(operand: GenericOperand): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const value = `${operand.value ?? 'MISSING_VALUE'}`;
    return (operand as OperandFact).path ? (operand as OperandFact).path!.replace(/^[$]/, value) : value;
  }
}
