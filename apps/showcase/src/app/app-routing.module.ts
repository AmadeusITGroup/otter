import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'configuration', loadComponent: () => import('./configuration/index').then((m) => m.ConfigurationComponent)},
  {path: 'localization', loadComponent: () => import('./localization/index').then((m) => m.LocalizationComponent)},
  {path: 'dynamic-content', loadComponent: () => import('./dynamic-content/index').then((m) => m.DynamicContentComponent)},
  {path: 'rules-engine', loadComponent: () => import('./rules-engine/index').then((m) => m.RulesEngineComponent)},
  {path: 'home', loadComponent: () => import('./home/index').then((m) => m.HomeComponent)},
  {path: 'run-app-locally', loadComponent: () => import('./run-app-locally/index').then((m) => m.RunAppLocallyComponent)},
  {path: '**', redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {scrollPositionRestoration: 'enabled'})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
