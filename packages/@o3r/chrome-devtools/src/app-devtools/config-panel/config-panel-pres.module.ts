import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigFormModule } from '../../components/config-form/config-form.module';
import { ConfigPanelPresComponent } from './config-panel-pres.component';

@NgModule({
  imports: [CommonModule, NgbAccordionModule, ConfigFormModule],
  declarations: [ConfigPanelPresComponent],
  exports: [ConfigPanelPresComponent]
})
export class ConfigPanelPresModule {}
