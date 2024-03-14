import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnDestroy, type Signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetStylingVariableContentMessage, StylingVariables } from '@o3r/styling';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, startWith, throttleTime } from 'rxjs/operators';
import { ChromeExtensionConnectionService } from '../../services/connection.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DfTooltipModule } from '@design-factory/design-factory';
import { resolveVariable, searchFn, type Variable } from './common';
import { IsRefPipe } from './is-ref.pipe';
import { ColorPipe } from './color.pipe';
import { VariableLabelPipe } from './variable-label.pipe';

@Component({
  selector: 'o3r-theming-panel-pres',
  templateUrl: './theming-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    AsyncPipe,
    IsRefPipe,
    ReactiveFormsModule,
    FormsModule,
    ColorPipe,
    NgbTypeaheadModule,
    VariableLabelPipe,
    DfTooltipModule
  ]
})
export class ThemingPanelPresComponent implements OnDestroy {
  public filteredThemeVariables$: Observable<StylingVariables>;
  public themeVariables$: Observable<StylingVariables>;
  public variables$: Observable<StylingVariables>;
  public form = new FormGroup({
    variables: new FormGroup<Record<string, FormControl<string | null>>>({}),
    search: new FormControl('')
  });
  public resolvedVariables: Signal<Record<string, string>>;

  private readonly subscription = new Subscription();

  constructor(
    connectionService: ChromeExtensionConnectionService
  ) {
    connectionService.sendMessage(
      'requestMessages',
      {
        only: 'getStylingVariable'
      }
    );
    this.variables$ = connectionService.message$.pipe(
      filter((message): message is GetStylingVariableContentMessage => message.dataType === 'getStylingVariable'),
      map((message) => message.variables)
    );
    this.resolvedVariables = toSignal(
      combineLatest([
        this.variables$.pipe(startWith([])),
        this.form.controls.variables.valueChanges.pipe(startWith({}))
      ]).pipe(
        map(([variables, runtimeValues]) => variables.reduce((acc: Record<string, string>, variable) => {
          acc[variable.name] = resolveVariable(variable.name, runtimeValues, variables) || '';
          return acc;
        }, {}))
      ),
      { initialValue: {} }
    );
    this.themeVariables$ = this.variables$.pipe(
      map((variables) => variables.filter((variable) => variable.category === 'theme'))
    );
    this.filteredThemeVariables$ = combineLatest([
      this.themeVariables$,
      this.form.controls.search.valueChanges.pipe(
        map((search) => search?.toLowerCase()),
        throttleTime(500),
        startWith('')
      )
    ]).pipe(
      map(([themeVariables, search]) => search
        ? themeVariables.filter((variable) => searchFn(variable, search)
        )
        : themeVariables
      ),
      startWith([])
    );
    this.subscription.add(
      this.themeVariables$.subscribe((themeVariables) => {
        const variablesControl = this.form.controls.variables;
        themeVariables.forEach((variable) => {
          const value = variable.runtimeValue ?? variable.defaultValue;
          const control = variablesControl.controls[variable.name];
          if (!control) {
            const newControl = new FormControl(value);
            variablesControl.addControl(variable.name, newControl);
            this.subscription.add(
              newControl.valueChanges.pipe(
                throttleTime(500)
              ).subscribe((newValue) => {
                connectionService.sendMessage('updateStylingVariables', {
                  variables: {
                    [variable.name]: newValue
                  }
                });
              })
            );
          } else {
            control.setValue(value, { emitEvent: false });
          }
        });
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public variableSearch = (currentVariable: Variable) => (text$: Observable<string>): Observable<string[]> => {
    return combineLatest([
      text$, this.variables$, this.form.controls.variables.valueChanges.pipe(startWith({}))
    ]).pipe(
      throttleTime(500),
      map(([term, variables, runtimeValues]) =>
        term
          ? variables
            .filter((variable) =>
              currentVariable.name !== variable.name
              && currentVariable.type === variable.type
              && typeof resolveVariable(variable.name, runtimeValues, variables) !== 'undefined'
              && searchFn(variable, term))
            .map(({name}) => `var(--${name})`)
          : []
      )
    );
  };

  public onColorChange(variableName: string, event: UIEvent) {
    this.form.controls.variables.controls[variableName].setValue((event.target as HTMLInputElement).value);
  }

  public onColorReset(variable: Variable) {
    this.form.controls.variables.controls[variable.name].setValue(variable.defaultValue);
  }
}
