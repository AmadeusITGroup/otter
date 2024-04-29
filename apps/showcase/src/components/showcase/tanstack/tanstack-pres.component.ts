import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbHighlight, NgbPagination, NgbPaginationPages } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';
import { OtterPickerPresComponent } from '../../utilities';
import { TanstackService } from './tanstack.service';
import { AngularQueryDevtools } from '@tanstack/angular-query-devtools-experimental';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { PetstoreStoreModule } from './store/petstore/index';
import { ContactStoreModule } from './store/contact/index';


@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-tanstack-pres',
  standalone: true,
  imports: [
    NgbHighlight,
    FormsModule,
    NgbPagination,
    OtterPickerPresComponent,
    NgbPaginationPages,
    AngularQueryDevtools,
    JsonPipe,
    AsyncPipe,
    PetstoreStoreModule,
    ContactStoreModule
  ],
  providers: [TanstackService],
  templateUrl: './tanstack-pres.template.html',
  styleUrls: ['./tanstack-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TanstackPresComponent {
  public service = inject(TanstackService);
}
