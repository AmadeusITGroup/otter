import {
  DOCUMENT,
  JsonPipe,
  KeyValuePipe,
  NgClass
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  type ElementRef,
  inject,
  signal,
  type Signal,
  untracked,
  viewChild,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import {
  toSignal
} from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
  Validators
} from '@angular/forms';
import {
  DfTooltipModule,
  DfTriggerClickDirective
} from '@design-factory/design-factory';
import {
  combineLatest,
  map
} from 'rxjs';
import type {
  State
} from '../../extension/interface';
import {
  StateService
} from '../../services';
import {
  getBestColorContrast
} from '../theming-panel/color.helpers';

type StateForm = {
  name: FormControl<string | null | undefined>;
  color: FormControl<string | null | undefined>;
};

type StatesPanelForm = {
  newStateName: FormControl<string | null | undefined>;
  newStateColor: FormControl<string | null | undefined>;
  states: FormGroup<Record<string, FormGroup<StateForm>>>;
};

const duplicateNameValidator: ValidatorFn = (control: AbstractControl<string>): ValidationErrors | null => {
  const mainForm = (control.parent?.parent?.parent ?? control.parent) as FormGroup<StatesPanelForm> | null | undefined;
  const names = new Set<string>();
  const controls = Object.values(mainForm?.controls.states.controls || {}).map((ctrl) => ctrl.controls.name);
  for (const ctrl of controls) {
    if (ctrl !== control && control.value === ctrl.value && names.has(control.value)) {
      return {
        duplicateName: `${control.value} is duplicated`
      };
    }
    if (ctrl.value) {
      names.add(ctrl.value);
    }
  }
  return null;
};

const stateNameValidators = [Validators.required, duplicateNameValidator];

const createStateForm = (name: string, color?: string | null) => new FormGroup<StateForm>({
  name: new FormControl(name, stateNameValidators),
  color: new FormControl(color)
});

@Component({
  selector: 'o3r-state-panel',
  templateUrl: './state-panel.template.html',
  styles: `
    .list-group-item > i {
      cursor: pointer;
    }
    .list-group-item > i.disabled {
      cursor: not-allowed;
    }
    .import-state-text:empty {
      margin: 0 !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    KeyValuePipe,
    JsonPipe,
    ReactiveFormsModule,
    FormsModule,
    DfTriggerClickDirective,
    DfTooltipModule,
    NgClass
  ]
})
export class StatePanelComponent {
  private readonly document = inject(DOCUMENT);
  private readonly stateService = inject(StateService);
  private readonly formBuilder = inject(FormBuilder);

  public readonly importStateText = viewChild<ElementRef<HTMLSpanElement>>('importStateText');
  public readonly states = this.stateService.states;
  public readonly activeState = this.stateService.activeState;
  public readonly localState = this.stateService.localState;
  public readonly hasLocalChanges = this.stateService.hasLocalChanges;
  public readonly newStateNameErrorMessage: Signal<string | null>;
  public readonly downloadState: WritableSignal<{ text: string; success: boolean } | null> = signal<{ text: string; success: boolean } | null>(null);
  public readonly form = this.formBuilder.group<StatesPanelForm>({
    newStateName: new FormControl('', stateNameValidators),
    newStateColor: new FormControl(''),
    states: this.formBuilder.group(
      Object.values(this.states()).reduce((acc: Record<string, FormGroup<StateForm>>, { name, color }) => {
        acc[name] = createStateForm(name, color);
        return acc;
      }, {})
    )
  });

  constructor() {
    effect(() => {
      const states = this.states();
      const statesControl = this.form.controls.states;
      Object.values(states).forEach((state) => {
        if (!statesControl.controls[state.name]) {
          const control = createStateForm(state.name, state.color);
          statesControl.addControl(state.name, control);
          if (untracked(this.activeState)?.name !== state.name) {
            control.disable();
          }
        }
      });
    });
    effect(() => {
      const activeState = this.activeState();
      Object.entries(this.form.controls.states.controls).forEach(([key, control]) => {
        if (activeState?.name === key) {
          control.enable();
        } else {
          control.disable();
        }
      });
    });
    const newStateNameControl = this.form.controls.newStateName;
    effect(() => {
      if (this.hasLocalChanges()) {
        this.form.controls.newStateColor.enable();
        newStateNameControl.enable();
      } else {
        this.form.controls.newStateColor.disable();
        newStateNameControl.disable();
      }
    });
    this.newStateNameErrorMessage = toSignal(
      combineLatest([
        newStateNameControl.valueChanges,
        newStateNameControl.statusChanges
      ]).pipe(
        map(() => newStateNameControl.errors
          ? (newStateNameControl.errors.required
            ? 'Please provide a state name.'
            : 'Please provide a unique name.')
          : null
        )
      ),
      { initialValue: null }
    );
  }

  private saveState(oldStateName: string, stateName: string, stateColor: string) {
    this.stateService.updateState(
      oldStateName,
      {
        ...this.localState(),
        name: stateName,
        color: stateColor,
        colorContrast: getBestColorContrast(stateColor)
      }
    );
    this.stateService.setActiveState(stateName);
  }

  /**
   * Update a state and save its content in the Chrome Extension store.
   * @param stateName
   */
  public updateState(stateName: string) {
    const control = this.form.controls.states.controls[stateName];
    const activeState = this.activeState();
    if (control.valid && activeState?.name === stateName) {
      this.saveState(stateName, control.value.name!, control.value.color || 'black');
    }
  }

  /**
   * Create a new state and save its content in the Chrome Extension store.
   */
  public saveNewState() {
    if (this.form.value.newStateName) {
      this.saveState(this.form.value.newStateName, this.form.value.newStateName, this.form.value.newStateColor || 'black');
      this.form.controls.states.addControl(
        this.form.value.newStateName,
        createStateForm(this.form.value.newStateName, this.form.value.newStateColor)
      );
      this.form.controls.newStateColor.reset();
      this.form.controls.newStateName.reset();
    }
  }

  /**
   * Remove a state from the Chrome Extension application and store.
   * Note that the active store cannot be deleted.
   * @param stateName
   */
  public deleteState(stateName: string) {
    if (this.activeState()?.name !== stateName) {
      this.stateService.deleteState(stateName);
    }
  }

  /**
   * Download a state as a json file
   * @param stateName
   */
  public exportState(stateName: string) {
    const state = this.states()[stateName];
    if (!state) {
      return;
    }
    const a = this.document.createElement('a');
    const file = new Blob([JSON.stringify(state)], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = `${state.name}.json`;
    a.click();
  }

  /**
   * Download a state file, add it to the state list and share it .
   * @param event
   */
  public async onFileChange(event: InputEvent) {
    try {
      const element = event.target as HTMLInputElement;
      let fileContent: string | undefined;
      try {
        fileContent = element.files && element.files.length > 0 ? await element.files[0].text() : undefined;
      } catch {
        throw new Error('Unable to read file');
      }
      if (!fileContent) {
        throw new Error('Empty file');
      }
      let state: State;
      try {
        state = JSON.parse(fileContent) as State;
      } catch {
        throw new Error('Not a JSON file');
      }
      if (
        typeof state.name === 'string'
        && typeof state.color === 'string'
        && typeof state.colorContrast === 'string'
        && (
          typeof state.configurations === 'undefined'
          || typeof state.configurations === 'object'
        )
        && (
          typeof state.localizations === 'undefined'
          || (
            typeof state.localizations === 'object'
            && Object.values(state.localizations).every((lang) =>
              typeof lang === 'object'
              && Object.values(lang).every((loc) => typeof loc === 'string')
            )
          )
        )
        && (
          typeof state.stylingVariables === 'undefined'
          || (
            typeof state.stylingVariables === 'object'
            && Object.values(state.stylingVariables).every((variable) => typeof variable === 'string')
          )
        )
      ) {
        if (Object.keys(this.states()).includes(state.name)) {
          throw new Error(`${state.name} already exists`);
        }
        this.stateService.updateState(
          state.name,
          {
            name: state.name,
            color: state.color,
            colorContrast: state.colorContrast,
            configurations: state.configurations,
            localizations: state.localizations,
            stylingVariables: state.stylingVariables
          }
        );
        this.downloadState.set({ text: `${state.name} imported correctly`, success: true });
      } else {
        throw new Error('Invalid state');
      }
    } catch (e) {
      this.downloadState.set({ text: (e as Error).message, success: false });
    } finally {
      // Clear the input once processed
      (event.target as HTMLInputElement).value = '';
    }
  }
}
