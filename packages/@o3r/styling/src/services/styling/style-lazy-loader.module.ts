import {
  NgModule
} from '@angular/core';
import {
  DynamicContentModule
} from '@o3r/dynamic-content';

/**
 * @deprecated use StyleLazyLoaderModule exported by @o3r/dynamic-content instead, will be removed in v12
 */
@NgModule({
  imports: [DynamicContentModule]
})
export class StyleLazyLoaderModule {}
