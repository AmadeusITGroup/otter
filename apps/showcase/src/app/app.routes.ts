import {
  Routes,
} from '@angular/router';
import {
  providePlaceholder,
} from '@o3r/components';
import {
  providePlaceholderRulesEngineAction,
} from '@o3r/components/rules-engine';
import {
  provideConfigOverrideStore,
  provideConfigurationStore,
} from '@o3r/configuration';
import {
  provideConfigurationRulesEngineAction,
} from '@o3r/configuration/rules-engine';
import {
  provideAssetPathOverrideStore,
} from '@o3r/dynamic-content';
import {
  provideAssetRulesEngineAction,
} from '@o3r/dynamic-content/rules-engine';

export const appRoutes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'configuration',
    loadComponent: () => import('./configuration/index').then((m) => m.Configuration),
    providers: [
      provideConfigurationStore()
    ],
    title: 'Otter Showcase - Configuration'
  },
  { path: 'component-replacement', loadComponent: () => import('./component-replacement/index').then((m) => m.ComponentReplacement), title: 'Otter Showcase - Component replacement' },
  { path: 'design-token', loadComponent: () => import('./design-token/index').then((m) => m.DesignToken), title: 'Otter Showcase - Design Token' },
  { path: 'localization', loadComponent: () => import('./localization/index').then((m) => m.Localization), title: 'Otter Showcase - Localization' },
  { path: 'dynamic-content', loadComponent: () => import('./dynamic-content/index').then((m) => m.DynamicContent), title: 'Otter Showcase - Dynamic Content' },
  {
    path: 'rules-engine',
    loadComponent: () => import('./rules-engine/index').then((m) => m.RulesEngine),
    title: 'Otter Showcase - Rules Engine',
    providers: [
      provideConfigurationRulesEngineAction(),
      provideAssetRulesEngineAction(),
      provideConfigOverrideStore(),
      provideAssetPathOverrideStore(),
      provideConfigurationStore(),
      providePlaceholderRulesEngineAction()
    ]
  },
  { path: 'home', loadComponent: () => import('./home/index').then((m) => m.Home), title: 'Otter Showcase - Home' },
  { path: 'run-app-locally', loadComponent: () => import('./run-app-locally/index').then((m) => m.RunAppLocally), title: 'Otter Showcase - Run App Locally' },
  { path: 'sdk', loadComponent: () => import('./sdk/index').then((m) => m.Sdk), title: 'Otter Showcase - SDK' },
  { path: 'sdk-intro', loadComponent: () => import('./sdk-intro/index').then((m) => m.SdkIntro), title: 'Otter Showcase - SDK Introduction' },
  {
    path: 'placeholder',
    loadComponent: () => import('./placeholder/index').then((m) => m.Placeholder),
    title: 'Otter Showcase - Placeholder',
    providers: [
      providePlaceholderRulesEngineAction(),
      providePlaceholder()
    ]
  },
  { path: 'sdk-training', loadComponent: () => import('./sdk-training/index').then((m) => m.SdkTraining), title: 'Otter Showcase - SDK Training' },
  { path: 'forms', loadComponent: () => import('./forms/index').then((m) => m.Forms), title: 'Otter Showcase - Forms' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
] as const satisfies Routes;
