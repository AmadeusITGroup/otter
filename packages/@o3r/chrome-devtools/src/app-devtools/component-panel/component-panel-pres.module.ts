import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OtterComponentModule } from '../../components/otter-component/otter-component.module';
import { ComponentPanelPresComponent } from './component-panel-pres.component';

@NgModule({
  imports: [
    CommonModule,
    OtterComponentModule
  ],
  declarations: [ComponentPanelPresComponent],
  exports: [ComponentPanelPresComponent]
})
export class ComponentPanelPresModule {}
