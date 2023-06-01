import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { O3rOnNavigationPreloadingStrategy } from '@o3r/routing';

const appRoutes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: O3rOnNavigationPreloadingStrategy
    })
  ],
  providers: [O3rOnNavigationPreloadingStrategy],
  exports: [RouterModule]
})
export class AppRoutingModule {}
