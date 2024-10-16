import { ChangeDetectionStrategy, Component, computed, effect, type OnDestroy, type Signal, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DfTooltipModule } from '@design-factory/design-factory';
import { NgbAccordionModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { computeItemIdentifier } from '@o3r/core';
import { type GetStylingVariableContentMessage, PALETTE_TAG_NAME, type StylingVariable, THEME_TAG_NAME } from '@o3r/styling';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith, throttleTime } from 'rxjs/operators';
import { ChromeExtensionConnectionService } from '../../services/connection.service';
import { DEFAULT_PALETTE_VARIANT, getPaletteColors } from './color.helpers';
import { AccessibilityConstrastScorePipe, ConstrastPipe, HexColorPipe } from './color.pipe';
import { getVariant, resolveVariable, searchFn } from './common';
import { IsRefPipe } from './is-ref.pipe';
import { MemoizePipe } from './memoize.pipe';
import { VariableLabelPipe } from './variable-label.pipe';
import { VariableNamePipe } from './variable-name.pipe';

const THROTTLE_TIME = 100;

/** Available grouping method for styling variable */
export type VariableGroupType = 'type' | 'category' | 'component';

/** Group of styling variable */
export interface VariableGroup {
  /**
   * Is the group containing only palette colors
   */
  isPalette: boolean;
  /**
   * Name of the group
   */
  name: string;
  /**
   * List of variables
   */
  variables: StylingVariable[];
  /**
   * Default variable when the group is a palette
   */
  defaultVariable?: StylingVariable;
}

@Component({
  selector: 'o3r-theming-panel-pres',
  templateUrl: './theming-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    IsRefPipe,
    NgbAccordionModule,
    ReactiveFormsModule,
    FormsModule,
    HexColorPipe,
    ConstrastPipe,
    AccessibilityConstrastScorePipe,
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
  public readonly variables: Signal<StylingVariable[]>;
  public readonly groupedVariables: Signal<VariableGroup[]>;
  public readonly form = new FormGroup({
    variables: new FormGroup<Record<string, FormControl<string | null>>>({}),
    search: new FormControl(''),
    themeOnly: new FormControl(true),
    groupBy: new FormControl<VariableGroupType>('category')
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
    this.variables = toSignal(this.variables$, { initialValue: [] });
    this.variablesMap = computed(() => this.variables().reduce((acc: Record<string, StylingVariable>, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {}));
    this.resolvedVariables = computed(() => this.variables().reduce((acc: Record<string, string>, variable, _, array) => {
      acc[variable.name] = resolveVariable(variable.name, this.runtimeValues(), array) || '';
      return acc;
    }, {}));
    this.numberOfVariables = computed(() => Object.keys(this.resolvedVariables()).length);

    const search = toSignal(this.form.controls.search.valueChanges.pipe(
      map((value) => (value || '').toLowerCase()),
      throttleTime(THROTTLE_TIME, undefined, { trailing: true })
    ), { initialValue: '' });

    const onlyTheme = toSignal(this.form.controls.themeOnly.valueChanges, { initialValue: true });

    const filteredVariables = computed(() => {
      const searchText = search();
      const vars = onlyTheme()
        ? this.variables()
          .filter((variable) => variable.tags?.includes(THEME_TAG_NAME) || variable.tags?.includes(PALETTE_TAG_NAME))
        : this.variables();
      return searchText ? vars.filter((variable) => searchFn(variable, searchText)) : vars;
    });

    const groupBy = toSignal(this.form.controls.groupBy.valueChanges, { initialValue: 'category' });

    this.groupedVariables = computed(() => {
      const group = groupBy() || 'category';
      const vars = filteredVariables();
      return Object.entries(
        vars.reduce((acc: Record<string, StylingVariable[]>, curr: StylingVariable) => {
          const varGroup = (
            group === 'component'
              ? curr.component && computeItemIdentifier(curr.component.name, curr.component.library)
              : curr[group]
          ) || 'others';
          acc[varGroup] ||= [];
          acc[varGroup].push(curr);
          return acc;
        }, {})
      ).reduce((acc: VariableGroup[], [name, variables]) => {
        const isPalette = group === 'category' && variables.every((variable) => variable.tags?.includes(PALETTE_TAG_NAME));
        const defaultVariable = isPalette ? variables.find((variable) => getVariant(variable.name) === DEFAULT_PALETTE_VARIANT) : undefined;
        return acc.concat([{
          name,
          variables,
          isPalette,
          defaultVariable
        }]);
      }, []).sort((a, b) => {
        // Others should go at the end
        if (a.name === 'others') {
          return 1;
        }
        if (b.name === 'others') {
          return -1;
        }
        // Palette should come first
        if (a.isPalette && !b.isPalette) {
          return -1;
        }
        if (!a.isPalette && b.isPalette) {
          return 1;
        }
        // Alphabetical order
        return a.name > b.name ? 1 : -1;
      });
    });

    effect(() => {
      const variablesControl = this.form.controls.variables;
      this.variables().forEach((variable) => {
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

  private changeColor(variableName: string, value: string) {
    this.form.controls.variables.controls[variableName].setValue(value);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Typeahead search function
   * @param currentVariable
   */
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

  /**
   * Handler for color picker change
   * @param variableName
   * @param event
   */
  public onColorChange(variableName: string, event: UIEvent) {
    this.changeColor(variableName, (event.target as HTMLInputElement).value);
  }

  /**
   * Handler for color reset
   * @param variable
   */
  public onColorReset(variable: StylingVariable) {
    this.changeColor(variable.name, variable.defaultValue);
  }

  /**
   * Handler for palette color change
   * @param paletteGroup
   * @param event
   */
  public onPaletteChange(paletteGroup: VariableGroup, event: UIEvent) {
    const baseColor = (event.target as HTMLInputElement).value;
    const palette = getPaletteColors(baseColor);
    paletteGroup.variables.forEach((variable) => {
      const variant = getVariant(variable.name);
      const color = variant ? palette[variant] : undefined;
      if (color) {
        this.changeColor(variable.name, color);
      }
    });
  }

  /**
   * Handler for palette color reset
   * @param palette
   * @param event
   */
  public onPaletteReset(palette: VariableGroup, event: UIEvent) {
    // Needed to not open or close the accordion
    event.preventDefault();
    event.stopPropagation();
    palette.variables.forEach((variable) => this.changeColor(variable.name, variable.defaultValue));
  }
}
