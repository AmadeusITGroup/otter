import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ChromeExtensionConnectionService } from '../../services/connection.service';
import { DebugPanelService } from './debug-panel.service';

@Component({
  selector: 'o3r-debug-panel-pres',
  templateUrl: './debug-panel-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DebugPanelPresComponent {
  /** Application information stream */
  public applicationInformation$ = this.service.applicationInformation$;

  constructor(private service: DebugPanelService, private connection: ChromeExtensionConnectionService) {}

  /** Refresh Application information */
  public refreshInfo() {
    this.connection.sendMessage('requestMessages', {
      only: ['applicationInformation']
    });
  }

  /**
   * Toggle localization key display
   *
   * @param event
   */
  public toggleLocalizationKey(event: UIEvent) {
    this.connection.sendMessage('displayLocalizationKeys', {
      toggle: (event.target as HTMLInputElement).checked
    });
  }

  /**
   * Toggle visual testing mode
   *
   * @param event
   */
  public toggleVisualTestingRender(event: UIEvent) {
    this.connection.sendMessage('toggleVisualTesting', {
      toggle: (event.target as HTMLInputElement).checked
    });
  }
}
