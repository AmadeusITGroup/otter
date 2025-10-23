import {
  AsyncPipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  DfSelectModule,
  DfTooltipModule,
} from '@design-factory/design-factory';
import {
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FactsSnapshotComponent,
  RulesetHistoryPresComponent,
} from '@o3r/rules-engine';
import {
  AppConnection,
} from '../components/app-connection/app-connection';
import type {
  State,
} from '../extension/interface';
import {
  StateService,
} from '../services';
import {
  ChromeExtensionConnectionService,
  isApplicationInformationMessage,
} from '../services/connection-service';
import {
  RulesetHistoryService,
} from '../services/ruleset-history-service';
import {
  ComponentPanelPres,
} from './component-panel/component-panel-pres';
import {
  ConfigPanelPres,
} from './config-panel/config-panel-pres';
import {
  DebugPanelPres,
} from './debug-panel/debug-panel-pres';
import {
  DebugPanelService,
} from './debug-panel/debug-panel-service';
import {
  LocalizationPanelPres,
} from './localization-panel/localization-panel-pres';
import {
  StatePanel,
} from './state-panel/state-panel';
import {
  ThemingPanelPres,
} from './theming-panel/theming-panel-pres';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styles: `
    :host ::ng-deep ng-select.local-change .ng-select-container {
      border-color: var(--df-recommend-warning-color);
      border-width: medium;
      box-sizing: content-box;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbNavModule,
    DebugPanelPres,
    RulesetHistoryPresComponent,
    ConfigPanelPres,
    ComponentPanelPres,
    AppConnection,
    LocalizationPanelPres,
    ThemingPanelPres,
    AsyncPipe,
    StatePanel,
    FormsModule,
    ReactiveFormsModule,
    DfSelectModule,
    DfTooltipModule,
    FactsSnapshotComponent
  ]
})
export class App {
  private readonly stateService = inject(StateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly connectionService = inject(ChromeExtensionConnectionService);
  private readonly debugPanelService = inject(DebugPanelService);
  private readonly rulesetHistoryService = inject(RulesetHistoryService);

  public readonly activeStateName = computed(() => this.stateService.activeState()?.name);
  public readonly states = computed(() => Object.values(this.stateService.states()));
  public readonly hasLocalChanges = this.stateService.hasLocalChanges;
  public readonly form = this.formBuilder.group({
    activeStateName: new FormControl(this.activeStateName())
  });

  public readonly rulesetExecutions$ = this.rulesetHistoryService.rulesetExecutions$;
  public readonly facts$ = this.rulesetHistoryService.facts$;

  constructor() {
    effect(() => {
      this.form.controls.activeStateName.setValue(this.activeStateName(), { emitEvent: false });
    });
    const message = toSignal(this.connectionService.message$);
    effect(() => {
      const msg = message();
      if (isApplicationInformationMessage(msg)) {
        this.debugPanelService.update(msg);
      }
    });
    this.form.controls.activeStateName.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((stateName) => this.stateService.setActiveState(stateName));
  }

  public stateCompareWithFn(state: State, selectedStateName: string) {
    return state.name === selectedStateName;
  }
}
