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
import {
  provideFormsWebMcpTools,
} from './forms/forms.webmcp';
import {
  provideSdkWebMcpTools,
} from './sdk/sdk.webmcp';

export const appRoutes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'configuration',
    loadComponent: () => import('./configuration/index').then((m) => m.Configuration),
    providers: [
      provideConfigurationStore()
    ],
    title: 'Otter Showcase - Configuration',
    data: { aiDescription: 'Demonstrates dynamic component configuration via CMS. Shows how Otter components can be configured at runtime without redeployment.' }
  },
  {
    path: 'component-replacement',
    loadComponent: () => import('./component-replacement/index').then((m) => m.ComponentReplacement),
    title: 'Otter Showcase - Component replacement',
    data: { aiDescription: 'Shows how components can be dynamically replaced at runtime, enabling A/B testing and progressive rollouts.' }
  },
  {
    path: 'design-token',
    loadComponent: () => import('./design-token/index').then((m) => m.DesignToken),
    title: 'Otter Showcase - Design Token',
    data: { aiDescription: 'Design token theming demonstration. Shows how to use design tokens for consistent styling across components.' }
  },
  {
    path: 'localization',
    loadComponent: () => import('./localization/index').then((m) => m.Localization),
    title: 'Otter Showcase - Localization',
    data: { aiDescription: 'Localization and internationalization features. Demonstrates translation management, locale switching, and ICU message format support.' }
  },
  {
    path: 'dynamic-content',
    loadComponent: () => import('./dynamic-content/index').then((m) => m.DynamicContent),
    title: 'Otter Showcase - Dynamic Content',
    data: { aiDescription: 'Dynamic content loading and management. Shows how assets and content can be overridden at runtime via a CMS.' }
  },
  {
    path: 'rules-engine',
    loadComponent: () => import('./rules-engine/index').then((m) => m.RulesEngine),
    title: 'Otter Showcase - Rules Engine',
    data: { aiDescription: 'Rules engine for dynamic UI behavior. Demonstrates how business rules can drive configuration, localization, and placeholder changes based on runtime facts.' },
    providers: [
      provideConfigurationRulesEngineAction(),
      provideAssetRulesEngineAction(),
      provideConfigOverrideStore(),
      provideAssetPathOverrideStore(),
      provideConfigurationStore(),
      providePlaceholderRulesEngineAction()
    ]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/index').then((m) => m.Home),
    title: 'Otter Showcase - Home',
    data: { aiDescription: 'Home page with an overview of the Otter framework and links to all feature demonstrations.' }
  },
  {
    path: 'run-app-locally',
    loadComponent: () => import('./run-app-locally/index').then((m) => m.RunAppLocally),
    title: 'Otter Showcase - Run App Locally',
    data: { aiDescription: 'Instructions and guide to run the Otter showcase application locally for development.' }
  },
  {
    path: 'sdk',
    loadComponent: () => import('./sdk/index').then((m) => m.Sdk),
    title: 'Otter Showcase - SDK',
    data: { aiDescription: 'Pet Store SDK demonstration. Shows how to use an Otter-generated TypeScript SDK to interact with a REST API (list, search, and view pets).' },
    providers: [
      provideSdkWebMcpTools()
    ]
  },
  {
    path: 'sdk-intro',
    loadComponent: () => import('./sdk-intro/index').then((m) => m.SdkIntro),
    title: 'Otter Showcase - SDK Introduction',
    data: { aiDescription: 'Introduction to the Otter SDK generator. Explains how to generate type-safe TypeScript SDKs from OpenAPI specifications.' }
  },
  {
    path: 'placeholder',
    loadComponent: () => import('./placeholder/index').then((m) => m.Placeholder),
    title: 'Otter Showcase - Placeholder',
    data: { aiDescription: 'Placeholder mechanism for dynamic component loading. Demonstrates how placeholders can be filled with components driven by the rules engine.' },
    providers: [
      providePlaceholderRulesEngineAction(),
      providePlaceholder()
    ]
  },
  {
    path: 'sdk-training',
    loadComponent: () => import('./sdk-training/index').then((m) => m.SdkTraining),
    title: 'Otter Showcase - SDK Training',
    data: { aiDescription: 'Interactive SDK training exercises. Step-by-step tutorials to learn how to use the Otter SDK in a real application.' }
  },
  {
    path: 'forms',
    loadComponent: () => import('./forms/index').then((m) => m.Forms),
    title: 'Otter Showcase - Forms',
    data: { aiDescription: 'Form handling with validation and error management. Demonstrates personal info and emergency contact forms with cross-field validation.' },
    providers: [
      provideFormsWebMcpTools()
    ]
  },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
] as const satisfies Routes;
