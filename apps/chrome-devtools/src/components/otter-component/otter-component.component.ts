import {
  KeyValuePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  Pipe,
  PipeTransform,
  SimpleChanges,
} from '@angular/core';
import {
  NgbAccordionModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import type {
  OtterLikeComponentInfo,
} from '@o3r/components';
import type {
  ConfigurationModel,
} from '@o3r/configuration';
import {
  type RulesetExecutionDebug,
  RulesetHistoryPresModule,
} from '@o3r/rules-engine';
import {
  ConfigFormComponent,
} from '../config-form/config-form.component';

const isRecordOfArray = (value?: object | null): value is Record<string, any[]> => {
  return value ? Object.values(value || {}).every((element) => Array.isArray(element)) : false;
};

@Pipe({
  name: 'nbProp',
  standalone: true
})
export class NbPropPipe implements PipeTransform {
  public transform(value: any[] | object | null | undefined, ignoredKeys: string[] = []) {
    if (Array.isArray(value)) {
      return value.length;
    }
    if (isRecordOfArray(value)) {
      return Object.entries(value)
        .reduce((acc: number, [key, curr]: [string, any[]]) => acc + (ignoredKeys.includes(key) ? 0 : curr.length), 0);
    }
    return Object.keys(value || {}).filter((key) => !ignoredKeys.includes(key)).length;
  }
}

@Pipe({
  name: 'list',
  standalone: true
})
export class ListPipe implements PipeTransform {
  public transform(value: string[]) {
    return value.length > 1
      ? `${
        value.splice(0, -1).join(', ')
      } and ${
        value.at(-1)
      }`
      : value[0] || '';
  }
}

@Component({
  selector: 'app-otter-component',
  templateUrl: './otter-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgbNavModule,
    ConfigFormComponent,
    RulesetHistoryPresModule,
    NgbAccordionModule,
    NbPropPipe,
    ListPipe,
    KeyValuePipe
  ]
})
export class OtterComponentComponent implements OnChanges {
  @Input()
  public componentName = '';

  @Input()
  public translations: OtterLikeComponentInfo['translations'];

  @Input()
  public analytics: OtterLikeComponentInfo['analytics'];

  @Input()
  public config: ConfigurationModel | undefined;

  @Input()
  public rulesetExecutions: RulesetExecutionDebug[] | undefined;

  public activeId = 1;

  /** Libraries linked to ruleset executions */
  public librariesLinkedToRulesetExecutions: string[] = [];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.rulesetExecutions) {
      this.librariesLinkedToRulesetExecutions = [...(
        new Set((this.rulesetExecutions || [])
          .flatMap((execution) => (execution.rulesetInformation?.linkedComponents?.or || [])
            .map((lc) => lc.library).filter((lib): lib is string => !!lib)
          )
        )
      )];
    }
  }
}
