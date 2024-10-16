import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChromeExtensionConnectionService } from '../../services/connection.service';
import { DebugPanelService } from './debug-panel.service';

type PlaceholderMode = 'normal' | 'debug' | 'pending';

@Component({
  selector: 'o3r-debug-panel-pres',
  templateUrl: './debug-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TitleCasePipe
  ]
})
export class DebugPanelPresComponent implements OnDestroy {
  public readonly form = new FormGroup({
    visualTesting: new FormControl<boolean>(false),
    placeholderMode: new FormControl<PlaceholderMode>('normal')
  });

  public placeholderModes: PlaceholderMode[] = ['normal', 'debug', 'pending'];

  /** Application information stream */
  public readonly applicationInformation$ = this.service.applicationInformation$;

  private readonly subscription = new Subscription();

  constructor(
    private readonly service: DebugPanelService,
    private readonly connection: ChromeExtensionConnectionService
  ) {
    this.subscription.add(
      this.form.controls.visualTesting.valueChanges.subscribe((value) => {
        this.toggleVisualTestingRender(!!value);
      })
    );
    this.subscription.add(
      this.form.controls.placeholderMode.valueChanges.subscribe((value) => {
        if (value) {
          this.togglePlaceholderMode(value);
        }
      })
    );
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

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
