import {
  type Logger,
} from '@o3r/logger';
import {
  getHostInfo,
} from '../host-info';

/** Default suffix for an url containing a theme css file */
export const THEME_URL_SUFFIX = '-theme.css';
/** Default name for the query parameter containing the theme name */
export const THEME_QUERY_PARAM_NAME = 'theme';

/** Options and context for Style helpers */
export interface StyleHelperOptions {
  /**
   * Logger to reporter the logs
   */
  logger?: Logger;
}

/**
 * Fetches a CSS document and returns the content as a string.
 * @param cssPath - The path to download the CSS.
 * @param options Options and context for Style helpers
 * @returns The content of the CSS document as a string, empty string if the fetch fails.
 */
export async function getStyle(cssPath: string, options?: StyleHelperOptions): Promise<string> {
  try {
    const myRequest = new Request(cssPath);
    const response = await fetch(myRequest);
    const cssText = response.ok ? await response.text() : '';
    return cssText;
  } catch (error) {
    options?.logger?.warn(`Failed to download style from: ${cssPath} with error: ${error?.toString()}`);
  }
  return '';
}

/**
 * Applies the given CSS theme as a stylesheet.
 * @param themeValue - CSS as text containing a theme definition.
 * @param cleanPrevious - Whether to remove previously applied stylesheets if no themeValue provided. Default is true.
 */
export function applyTheme(themeValue?: string, cleanPrevious = true): void {
  if (themeValue !== undefined) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(themeValue);
    document.adoptedStyleSheets = cleanPrevious ? [sheet] : [...document.adoptedStyleSheets, sheet];
  } else if (cleanPrevious) { // remove the styles if the theme value comes undefined or empty string
    document.adoptedStyleSheets = [];
  }
}

/**
 * Download the application additional theme
 * @param theme Name of the theme to download from the current application
 * @param options Options and context for Style helpers
 */
export function downloadApplicationThemeCss(theme: string, options?: StyleHelperOptions) {
  const cssHref = `${theme.endsWith('.css') ? theme : theme + THEME_URL_SUFFIX}`;
  return getStyle(cssHref, options);
}

/**
 * Applies the initial theme based on the URL query parameters.
 *
 * This function fetches the CSS theme specified in the URL query parameters and applies it as a stylesheet.
 * If a referrer is present, it also attempts to fetch and apply the theme from the referrer's URL.
 * @param options Options and context for Style helpers
 */
export async function applyInitialTheme(options?: StyleHelperOptions): Promise<PromiseSettledResult<void>[] | undefined> {
  const searchParams = new URLSearchParams(window.location.search);
  const theme = searchParams.get(THEME_QUERY_PARAM_NAME);
  document.adoptedStyleSheets = [];
  if (theme) {
    const themeRequest: Promise<void>[] = [];
    themeRequest.push(downloadApplicationThemeCss(theme, options).then((styleToApply) => applyTheme(styleToApply, false)));
    const hostInfo = getHostInfo();
    if (hostInfo.hostURL) {
      const url = new URL(hostInfo.hostURL);
      url.pathname += `${url.pathname.endsWith('/') ? '' : '/'}${theme}`;
      themeRequest.unshift(getStyle(url.toString(), options).then((styleToApply) => applyTheme(styleToApply, false)));
    }

    return Promise.allSettled(themeRequest);
  }
  return undefined;
}
