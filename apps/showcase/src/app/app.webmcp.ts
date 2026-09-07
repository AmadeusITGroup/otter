import {
  inject,
  provideExperimentalWebMcpTools,
} from '@angular/core';
import {
  Router,
} from '@angular/router';
import {
  LocalizationService,
} from '@o3r/transloco';
import {
  appRoutes,
} from './app.routes';

/**
 * Provides application-level WebMCP tools for navigation and localization.
 * These tools are available globally across all routes.
 */
export function provideAppWebMcpTools() {
  return provideExperimentalWebMcpTools([
    {
      name: 'navigateTo',
      description: 'Navigate to a specific page in the Otter showcase application.',
      inputSchema: {
        type: 'object',
        properties: {
          route: {
            type: 'string',
            description: 'The route path to navigate to. Use listAvailablePages to see all available routes.'
          }
        },
        required: ['route'],
        additionalProperties: false
      },
      execute: async ({ route }) => {
        const router = inject(Router);
        const validRoutes = appRoutes.map((r) => r.path).filter((p) => !!p && !p.includes('*'));
        if (typeof route !== 'string' || !validRoutes.includes(route as typeof validRoutes[number])) {
          return { content: [{ type: 'text', text: `Invalid route "${String(route)}". Valid routes are: ${validRoutes.join(', ')}` }] };
        }
        const success = await router.navigate([`/${route}`]);
        if (success) {
          return { content: [{ type: 'text', text: `Successfully navigated to /${route}` }] };
        }
        return { content: [{ type: 'text', text: `Navigation to /${route} was rejected by a route guard` }] };
      }
    },
    {
      name: 'listAvailablePages',
      description: 'List all available pages in the Otter showcase application with their descriptions.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: () => {
        const pages = appRoutes
          .filter((r): r is typeof appRoutes[number] & { title: string; data: { aiDescription: string } } => !!r.path && !r.path.includes('*') && 'data' in r && !!(r as any).data?.aiDescription)
          .map((r) => ({ route: r.path, title: r.title, description: r.data.aiDescription }));
        return { content: [{ type: 'text', text: JSON.stringify(pages, null, 2) }] };
      }
    },
    {
      name: 'switchLanguage',
      description: 'Switch the application language. Supported languages are en-GB (English) and fr-FR (French).',
      inputSchema: {
        type: 'object',
        properties: {
          language: {
            type: 'string',
            description: 'The language code to switch to. Supported values: "en-GB", "fr-FR".'
          }
        },
        required: ['language'],
        additionalProperties: false
      },
      execute: ({ language }) => {
        const localizationService = inject(LocalizationService);
        const supportedLanguages = localizationService.getLanguages();
        if (typeof language !== 'string' || !supportedLanguages.includes(language)) {
          return { content: [{ type: 'text', text: `Invalid language "${String(language)}". Supported languages: ${supportedLanguages.join(', ')}` }] };
        }
        localizationService.useLanguage(language);
        return { content: [{ type: 'text', text: `Language switched to ${language}` }] };
      }
    },
    {
      name: 'getCurrentLanguage',
      description: 'Get the current active language of the application.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: () => {
        const localizationService = inject(LocalizationService);
        const currentLang = localizationService.getCurrentLanguage();
        const availableLangs = localizationService.getLanguages();
        return { content: [{ type: 'text', text: JSON.stringify({ currentLanguage: currentLang, availableLanguages: availableLangs }) }] };
      }
    },
    {
      name: 'getCurrentRoute',
      description: 'Get the current active route of the application.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: () => {
        const router = inject(Router);
        const url = router.url.replace(/^\//, '');
        const route = appRoutes.find((r) => r.path === url);
        return { content: [{ type: 'text', text: JSON.stringify({ route: url, title: route && 'title' in route ? route.title : null }) }] };
      }
    }
  ]);
}
