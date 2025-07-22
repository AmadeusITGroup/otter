import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import type {
  Ruleset,
  RulesetExecutionErrorEvent,
  RulesetExecutionEvent,
} from '../../../engine';

export type RulesetExecutionStatus = 'Error' | 'Active' | 'Deactivated' | 'NoEffect';
/**
 * Model of a RulesetExecution with more information for debug purpose
 */
export type RulesetExecutionDebug = (RulesetExecutionEvent | RulesetExecutionErrorEvent) & {
  isActive: boolean;
  status: RulesetExecutionStatus;
  rulesetInformation: Ruleset | undefined;
};

@Component({
  selector: 'o3r-ruleset-history-pres',
  styleUrls: ['./ruleset-history-pres.style.scss'],
  templateUrl: './ruleset-history-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RulesetHistoryPresComponent {
  /**
   * Reflects the state of each ruleset expanded elements.
   * Each ruleset entry contains a list of subpanel that can be collapsed or expanded.
   * Ruleset whole panel status is store the 'ruleset' entry.
   * @example
   * Expanded ruleset with rule overview collapsed:
   * {'rulesetId': {'ruleset' : true, 'ruleOverview': false}}
   * @note Collapsing a ruleset will not reset the subpanel expansion status
   */
  public expansionStatus: { [key: string]: { [subpanel: string]: boolean } } = {};

  @Input()
  public rulesetExecutions: RulesetExecutionDebug[] = [];

  @Input()
  public executionDurationFormat = '1.3-3';

  constructor(private readonly cd: ChangeDetectorRef) {}

  /**
   * Toggle a ruleset subpanel
   * @param ruleId
   * @param subpanel element to collapse. 'ruleset' will toggle the whole panel but won't reset the subpanels states.
   */
  public toggleExpansion(ruleId: string, subpanel: string) {
    if (this.expansionStatus[ruleId]) {
      this.expansionStatus[ruleId][subpanel] = !this.expansionStatus[ruleId][subpanel];
    } else {
      this.expansionStatus[ruleId] = { [subpanel]: true };
    }
    this.cd.detectChanges();
  }
}
