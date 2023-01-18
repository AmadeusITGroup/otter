import { NgModule } from '@angular/core';
import { ConfigurationStoreModule } from '@o3r/configuration';
import { ComponentWrapper } from './component-wrapper.component';
import { ComponentWrapperService, wrapperService } from './component-wrapper.service';

@NgModule({
  imports: [ConfigurationStoreModule],
  declarations: [ComponentWrapper],
  exports: [ComponentWrapper],
  providers: [{provide: ComponentWrapperService, useValue: wrapperService}]
})
export class ComponentWrapperModule {}
