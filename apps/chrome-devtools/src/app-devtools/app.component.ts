import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DfSelectModule, DfTooltipModule } from '@design-factory/design-factory';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { RulesetHistoryPresModule } from '@o3r/rules-engine';
import { AppConnectionComponent } from '../components/app-connection/app-connection.component';
import type { State } from '../extension/interface';
import { StateService } from '../services';
import { ChromeExtensionConnectionService, isApplicationInformationMessage } from '../services/connection.service';
import { RulesetHistoryService } from '../services/ruleset-history.service';
import { ComponentPanelPresComponent } from './component-panel/component-panel-pres.component';
import { ConfigPanelPresComponent } from './config-panel/config-panel-pres.component';
import { DebugPanelPresComponent } from './debug-panel/debug-panel-pres.component';
import { DebugPanelService } from './debug-panel/debug-panel.service';
import { LocalizationPanelPresComponent } from './localization-panel/localization-panel-pres.component';
import { StatePanelComponent } from './state-panel/state-panel.component';
import { ThemingPanelPresComponent } from './theming-panel/theming-panel-pres.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: `
    :host ::ng-deep ng-select.local-change .ng-select-container {
      border-color: var(--bs-recommend-warning-color);
      border-width: medium;
      box-sizing: content-box;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgbNavModule,
    DebugPanelPresComponent,
    RulesetHistoryPresModule,
    ConfigPanelPresComponent,
    ComponentPanelPresComponent,
    AppConnectionComponent,
    LocalizationPanelPresComponent,
    ThemingPanelPresComponent,
    AsyncPipe,
    StatePanelComponent,
    FormsModule,
    ReactiveFormsModule,
    DfSelectModule,
    DfTooltipModule,
    JsonPipe
  ]
})
export class AppComponent {
  private readonly stateService = inject(StateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly connectionService = inject(ChromeExtensionConnectionService);
  private readonly debugPanelService = inject(DebugPanelService);
  private readonly rulesetHistoryService = inject(RulesetHistoryService);

  public readonly activeStateName = computed(() => this.stateService.activeState()?.name);
  public readonly states = computed(() => Object.values(this.stateService.states()));
  public readonly hasLocalChanges = this.stateService.hasLocalChanges;
  public form = this.formBuilder.group({
    activeStateName: new FormControl(this.activeStateName())
  });

  public rulesetExecutions$ = this.rulesetHistoryService.rulesetExecutions$;

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
