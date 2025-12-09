import {
  NgModule,
} from '@angular/core';
import {
  RouterModule,
  Routes,
} from '@angular/router';

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'configuration', loadComponent: () => import('./configuration/index').then((m) => m.Configuration), title: 'Otter Showcase - Configuration' },
  { path: 'component-replacement', loadComponent: () => import('./component-replacement/index').then((m) => m.ComponentReplacement), title: 'Otter Showcase - Component replacement' },
  { path: 'design-token', loadComponent: () => import('./design-token/index').then((m) => m.DesignToken), title: 'Otter Showcase - Design Token' },
  { path: 'localization', loadComponent: () => import('./localization/index').then((m) => m.Localization), title: 'Otter Showcase - Localization' },
  { path: 'dynamic-content', loadComponent: () => import('./dynamic-content/index').then((m) => m.DynamicContent), title: 'Otter Showcase - Dynamic Content' },
  { path: 'rules-engine', loadComponent: () => import('./rules-engine/index').then((m) => m.RulesEngine), title: 'Otter Showcase - Rules Engine' },
  { path: 'home', loadComponent: () => import('./home/index').then((m) => m.Home), title: 'Otter Showcase - Home' },
  { path: 'run-app-locally', loadComponent: () => import('./run-app-locally/index').then((m) => m.RunAppLocally), title: 'Otter Showcase - Run App Locally' },
  { path: 'sdk', loadComponent: () => import('./sdk/index').then((m) => m.Sdk), title: 'Otter Showcase - SDK' },
  { path: 'sdk-intro', loadComponent: () => import('./sdk-intro/index').then((m) => m.SdkIntro), title: 'Otter Showcase - SDK Introduction' },
  { path: 'placeholder', loadComponent: () => import('./placeholder/index').then((m) => m.Placeholder), title: 'Otter Showcase - Placeholder' },
  { path: 'sdk-training', loadComponent: () => import('./sdk-training/index').then((m) => m.SdkTraining), title: 'Otter Showcase - SDK Training' },
  { path: 'forms', loadComponent: () => import('./forms/index').then((m) => m.Forms), title: 'Otter Showcase - Forms' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled', useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
