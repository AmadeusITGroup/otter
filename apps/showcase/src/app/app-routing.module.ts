import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'configuration', loadComponent: () => import('./configuration/index').then((m) => m.ConfigurationComponent), title: 'Otter Showcase - Configuration'},
  {path: 'component-replacement', loadComponent: () => import('./component-replacement/index').then((m) => m.ComponentReplacementComponent), title: 'Otter Showcase - Component replacement'},
  {path: 'design-token', loadComponent: () => import('./design-token/index').then((m) => m.DesignTokenComponent), title: 'Otter Showcase - Design Token'},
  {path: 'localization', loadComponent: () => import('./localization/index').then((m) => m.LocalizationComponent), title: 'Otter Showcase - Localization'},
  {path: 'dynamic-content', loadComponent: () => import('./dynamic-content/index').then((m) => m.DynamicContentComponent), title: 'Otter Showcase - Dynamic Content'},
  {path: 'rules-engine', loadComponent: () => import('./rules-engine/index').then((m) => m.RulesEngineComponent), title: 'Otter Showcase - Rules Engine'},
  {path: 'home', loadComponent: () => import('./home/index').then((m) => m.HomeComponent), title: 'Otter Showcase - Home'},
  {path: 'run-app-locally', loadComponent: () => import('./run-app-locally/index').then((m) => m.RunAppLocallyComponent), title: 'Otter Showcase - Run App Locally'},
  {path: 'sdk', loadComponent: () => import('./sdk/index').then((m) => m.SdkComponent), title: 'Otter Showcase - SDK'},
  {path: 'sdk-intro', loadComponent: () => import('./sdk-intro/index').then((m) => m.SdkIntroComponent), title: 'Otter Showcase - SDK Introduction'},
  {path: 'placeholder', loadComponent: () => import('./placeholder/index').then((m) => m.PlaceholderComponent), title: 'Otter Showcase - Placeholder'},
  {path: 'sdk-training', loadComponent: () => import('./sdk-training/index').then((m) => m.SdkTrainingComponent), title: 'Otter Showcase - SDK Training'},
  {path: '**', redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {scrollPositionRestoration: 'enabled', useHash: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
