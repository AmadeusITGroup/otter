import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import type {
  AllBlock,
  Facts,
} from '../../../engine';

@Component({
  selector: 'o3r-rule-actions-pres',
  styleUrls: ['./rule-actions-pres.style.scss'],
  templateUrl: './rule-actions-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class RuleActionsPresComponent {
  /**
   * List of all the output actions of a rules or ruleset execution
   */
  @Input()
  public actions: AllBlock[] = [];

  /**
   * The list of temporary facts used and/or modified within the rule or the ruleset.
   * They are scoped to the ruleset and their value is the one after the rule or ruleset execution.
   */
  @Input()
  public temporaryFacts: Record<string, Facts> = {};

  /**
   * List of temporary facts that will be modified by the ruleset or the rule.
   */
  @Input()
  public runtimeOutputs: string[] = [];
}
