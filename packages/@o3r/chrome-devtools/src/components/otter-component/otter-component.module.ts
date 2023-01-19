import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbAccordionModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigFormModule } from '../config-form/config-form.module';
import { RulesetHistoryPresModule } from '@o3r/rules-engine';
import { ListPipe, NbPropPipe, OtterComponentComponent } from './otter-component.component';


@NgModule({
  declarations: [
    OtterComponentComponent,
    NbPropPipe,
    ListPipe
  ],
  exports: [OtterComponentComponent],
  imports: [
    CommonModule,
    NgbNavModule,
    ConfigFormModule,
    RulesetHistoryPresModule,
    NgbAccordionModule
  ],
  providers: [NbPropPipe, ListPipe]
})
export class OtterComponentModule { }
