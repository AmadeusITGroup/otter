import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app',
  templateUrl: './app.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
