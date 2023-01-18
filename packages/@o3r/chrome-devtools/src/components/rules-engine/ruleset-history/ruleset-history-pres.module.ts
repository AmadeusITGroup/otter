import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RuleActionsPresComponent } from '../rule-actions/rule-actions-pres.component';
import { RuleConditionPresComponent } from '../rule-condition/rule-condition-pres.component';
import { RuleKeyValuePresComponent } from '../rule-key-value/rule-key-value-pres.component';
import { RuleTreePresComponent } from '../rule-tree/rule-tree-pres.component';
import { FallbackToPipe } from '../shared/fallback-to.pipe';
import { RulesetHistoryPresComponent } from './ruleset-history-pres.component';

@NgModule({
  imports: [CommonModule, CommonModule, CommonModule],
  declarations: [FallbackToPipe, RulesetHistoryPresComponent, RuleConditionPresComponent, RuleTreePresComponent, RuleActionsPresComponent, RuleKeyValuePresComponent],
  exports: [RulesetHistoryPresComponent]
})
export class RulesetHistoryPresModule {}
