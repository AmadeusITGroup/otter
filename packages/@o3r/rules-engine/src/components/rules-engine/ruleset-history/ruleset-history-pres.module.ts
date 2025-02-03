import {
  JsonPipe,
} from '@angular/common';
import {
  NgModule,
} from '@angular/core';
import {
  RuleConditionPresComponent,
} from '../rule-condition/rule-condition-pres.component';
import {
  RulesetHistoryPresComponent,
} from './ruleset-history-pres.component';

/**
 * @deprecated The Components and Pipes are now standalone, this module will be removed in v14
 */
@NgModule({
  imports: [
    JsonPipe,
    RulesetHistoryPresComponent,
    RuleConditionPresComponent
  ],
  exports: [RulesetHistoryPresComponent]
})
export class RulesetHistoryPresModule {}
