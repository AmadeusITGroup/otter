import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import type { AllBlock, TopLevelCondition } from '../../../engine';

@Component({
  selector: 'o3r-rule-tree-pres',
  styleUrls: ['./rule-tree-pres.style.scss'],
  templateUrl: './rule-tree-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RuleTreePresComponent {

  /**
   * Rule name. Will only be defined at the root of the rule tree.
   */
  @Input()
  public name?: string;

  /**
   * Type of the block being resolved.
   * A type "IF_ELSE" will display two branches and the success and failure outputs associated
   * Else, only the successElements will be shown
   */
  @Input()
  public blockType = '';

  /**
   * The condition under which the success elements will be displayed.
   */
  @Input()
  public condition?: TopLevelCondition;

  /**
   * If case output
   */
  @Input()
  public successElements: AllBlock[] = [];

  /**
   * Else case output
   */
  @Input()
  public failureElements: AllBlock[] = [];

  /**
   * Should the "Else case scenario" actions be displayed
   */
  public failureActionsExpanded = false;

  /**
   * Should the "If case scenario" actions be displayed
   */
  public successActionsExpanded = false;
}
