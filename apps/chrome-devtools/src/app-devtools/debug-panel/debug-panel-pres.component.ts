import {
  AsyncPipe,
  TitleCasePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ChromeExtensionConnectionService,
} from '../../services/connection.service';
import {
  DebugPanelService,
} from './debug-panel.service';

type PlaceholderMode = 'normal' | 'debug' | 'pending';

@Component({
  selector: 'o3r-debug-panel-pres',
  templateUrl: './debug-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TitleCasePipe
  ]
})
export class DebugPanelPresComponent {
  public readonly form = new FormGroup({
    visualTesting: new FormControl<boolean>(false),
    placeholderMode: new FormControl<PlaceholderMode>('normal')
  });

  public placeholderModes: PlaceholderMode[] = ['normal', 'debug', 'pending'];

  /** Application information stream */
  public readonly applicationInformation$ = this.service.applicationInformation$;

  constructor(
    private readonly service: DebugPanelService,
    private readonly connection: ChromeExtensionConnectionService
  ) {
    this.form.controls.visualTesting.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.toggleVisualTestingRender(!!value);
    });
    this.form.controls.placeholderMode.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value) {
        this.togglePlaceholderMode(value);
      }
    });
  }

  /**
   * Toggle visual testing mode
   * @param toggle
   */
  private toggleVisualTestingRender(toggle: boolean) {
    this.connection.sendMessage('toggleVisualTesting', { toggle });
  }

  /**
   * Toggle placeholder mode
   * @param mode
   */
  private togglePlaceholderMode(mode: PlaceholderMode) {
    this.connection.sendMessage('placeholderMode', { mode });
  }

  /** Refresh Application information */
  public refreshInfo() {
    this.connection.sendMessage('requestMessages', {
      only: ['applicationInformation']
    });
  }
}
