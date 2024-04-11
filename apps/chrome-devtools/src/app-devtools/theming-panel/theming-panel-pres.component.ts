import { ChangeDetectionStrategy, Component, computed, effect, type OnDestroy, type Signal, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DfTooltipModule } from '@design-factory/design-factory';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { type GetStylingVariableContentMessage, type StylingVariable, THEME_TAG_NAME } from '@o3r/styling';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, throttleTime } from 'rxjs/operators';
import { ChromeExtensionConnectionService } from '../../services/connection.service';
import { ColorPipe } from './color.pipe';
import { resolveVariable, searchFn } from './common';
import { IsRefPipe } from './is-ref.pipe';
import { MemoizePipe } from './memoize.pipe';
import { VariableLabelPipe } from './variable-label.pipe';
import { VariableNamePipe } from './variable-name.pipe';

const THROTTLE_TIME = 100;

@Component({
  selector: 'o3r-theming-panel-pres',
  templateUrl: './theming-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    IsRefPipe,
    ReactiveFormsModule,
    FormsModule,
    ColorPipe,
    NgbTypeaheadModule,
    VariableLabelPipe,
    DfTooltipModule,
    MemoizePipe,
    VariableNamePipe
  ]
})
export class ThemingPanelPresComponent implements OnDestroy {
  public readonly resolvedVariables: Signal<Record<string, string>>;
  public readonly variablesMap: Signal<Record<string, StylingVariable>>;
  public readonly numberOfVariables: Signal<number>;
  public readonly themeVariables: Signal<StylingVariable[]>;
  public readonly filteredThemeVariables: Signal<StylingVariable[]>;
  public readonly form = new FormGroup({
    variables: new FormGroup<Record<string, FormControl<string | null>>>({}),
    search: new FormControl('')
  });

  private readonly variables$: Observable<StylingVariable[]>;
  private readonly subscription = new Subscription();
  private readonly runtimeValues$ = this.form.controls.variables.valueChanges.pipe(startWith({}));
  private readonly runtimeValues = toSignal(this.runtimeValues$, { initialValue: {} });

  constructor(
    connectionService: ChromeExtensionConnectionService
  ) {
    this.variables$ = connectionService.message$.pipe(
      filter((message): message is GetStylingVariableContentMessage => message.dataType === 'getStylingVariable'),
      map((message) => message.variables),
      startWith([]),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
    const variables = toSignal(this.variables$, { initialValue: [] });
    this.variablesMap = computed(() => variables().reduce((acc: Record<string, StylingVariable>, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {}));
    this.resolvedVariables = computed(() => variables().reduce((acc: Record<string, string>, variable, _, array) => {
      acc[variable.name] = resolveVariable(variable.name, this.runtimeValues(), array) || '';
      return acc;
    }, {}));
    this.numberOfVariables = computed(() => Object.keys(this.resolvedVariables()).length);
    this.themeVariables = computed(() => variables().filter((variable) => variable.tags?.includes(THEME_TAG_NAME)));

    const search = toSignal(this.form.controls.search.valueChanges.pipe(
      map((value) => (value || '').toLowerCase()),
      throttleTime(THROTTLE_TIME, undefined, { trailing: true })
    ), { initialValue: '' });

    this.filteredThemeVariables = computed(() => {
      const searchText = search();
      return searchText ? this.themeVariables().filter((variable) => searchFn(variable, searchText)) : this.themeVariables();
    });

    effect(() => {
      const variablesControl = this.form.controls.variables;
      this.themeVariables().forEach((variable) => {
        const value = variable.runtimeValue ?? variable.defaultValue;
        const control = variablesControl.controls[variable.name];
        if (!control) {
          const newControl = new FormControl(value);
          variablesControl.addControl(variable.name, newControl);
          this.subscription.add(
            newControl.valueChanges.pipe(
              throttleTime(THROTTLE_TIME, undefined, { trailing: true })
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
    });

    connectionService.sendMessage(
      'requestMessages',
      {
        only: 'getStylingVariable'
      }
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public variableSearch = (currentVariable: StylingVariable) => (text$: Observable<string>): Observable<string[]> => combineLatest([
    text$, this.variables$, this.runtimeValues$
  ]).pipe(
    throttleTime(THROTTLE_TIME, undefined, { trailing: true }),
    map(([term, variables, runtimeValues]) => term
      ? variables
        .filter((variable: StylingVariable) =>
          currentVariable.name !== variable.name
          && currentVariable.type === variable.type
          && typeof resolveVariable(variable.name, runtimeValues, variables) !== 'undefined'
          && searchFn(variable, term))
        .map(({name}: StylingVariable) => `var(--${name})`)
      : [])
  );

  public onColorChange(variableName: string, event: UIEvent) {
    this.form.controls.variables.controls[variableName].setValue((event.target as HTMLInputElement).value);
  }

  public onColorReset(variable: StylingVariable) {
    this.form.controls.variables.controls[variable.name].setValue(variable.defaultValue);
  }
}
