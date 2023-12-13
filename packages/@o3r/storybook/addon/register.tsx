// eslint-disable-next-line no-use-before-define
import { addons, types } from '@storybook/addons';
import { AddonPanel } from '@storybook/components';
import React, { useState } from 'react';

import type { Configuration } from '@o3r/core';
import { CONFIGURATION_PREFIX } from '../src/configuration/configuration-configs.interface';
import { STYLING_PREFIX } from '../src/styling/style-configs.interface';
import ExporterToolbar from './exporter';
import { downloadFile, generateThemeCss } from './helpers';
import ThemePanel from './theme';

/** State of the Theme Panel */
export interface ThemePanelState {
  /** Theme map */
  theme: Record<string, string>;
  /** Default theme map value */
  baseTheme: Record<string, string>;
  /** Name of the selected theme */
  selectedThemeName: string | undefined;
}

const ADDON_ID = 'otter';

addons.register(ADDON_ID, (api) => {

  // ---------- Theme tab ----------
  let updatedTheme: Record<string, string> | undefined;
  let selectedThemeName: string | undefined;
  addons.add(`${ADDON_ID}/theme-panel`, {
    type: types.PANEL,
    title: 'Theme',
    render: ({active}) => {
      const themes: Record<string, Record<string, string>> = api.getCurrentParameter('themes');
      const themeNames = themes && Object.keys(themes);
      selectedThemeName = !selectedThemeName && themeNames && themeNames[0] || selectedThemeName;
      const baseTheme: Record<string, string> = selectedThemeName && themes[selectedThemeName] || {};
      const [state, setState] = useState<ThemePanelState>({ theme: updatedTheme || baseTheme, baseTheme, selectedThemeName });

      const updateTheme = (theme: Record<string, string>) => {
        updatedTheme = theme;
        setState({ theme, baseTheme, selectedThemeName });
        api.updateGlobals({theme});
      };

      const updateSelectedTheme = (themeName: string) => {
        selectedThemeName = themeName;
        const newBaseTheme: Record<string, string> = selectedThemeName && themes && themes[selectedThemeName] || {};
        updatedTheme = newBaseTheme;
        setState({ theme: newBaseTheme, baseTheme: newBaseTheme, selectedThemeName });
        api.updateGlobals({ theme: newBaseTheme });
      };

      const loadTheme = (theme: Record<string, string>) => {
        selectedThemeName = undefined;
        const mergeTheme = { ...state.theme, ...theme };
        setState({ theme: mergeTheme, baseTheme: mergeTheme, selectedThemeName });
        api.updateGlobals({ theme });
      };

      if (!active) {
        return <span></span>;
      }
      if (!updatedTheme) {
        updateTheme(baseTheme);
      }
      return (
        <AddonPanel active={active}>
          <ThemePanel
            theme={state.theme}
            themeName={state.selectedThemeName}
            themeNameList={themeNames}
            baseTheme={state.baseTheme}
            onThemeChange={updateTheme}
            onThemeNameChange={updateSelectedTheme}
            onThemeImport={loadTheme}/>
        </AddonPanel>
      );
    }
  });

  // ---------- Exporter toolbar ----------
  /** Generate and download theme css file */
  const exportTheme = () => {
    const baseTheme: Record<string, string> = api.getCurrentParameter('theme') || {};
    const css = generateThemeCss(updatedTheme || {}, baseTheme);
    downloadFile(css, 'text/css', 'theme-download-link');
  };

  /** Generate and download Configuration file file */
  const exportConfig = () => {
    const regexp = new RegExp(`^${CONFIGURATION_PREFIX}`);
    const { args, initialArgs, parameters }: { args: Record<string, any> | undefined; initialArgs: Record<string, any> | undefined; parameters: Record<string, any> } =
      api.getCurrentStoryData() as any;
    const config = !args ? {} : Object.entries(args)
      .filter(([key, value]) => regexp.test(key) && typeof value !== 'function' && (!initialArgs || value !== initialArgs[key]))
      .reduce<Configuration>((acc, [key, value]) => {
        acc[key.replace(regexp, '')] = value;
        return acc;
      }, {});
    const componentId = parameters.componentId || { name: 'unknown', library: 'unknown' };
    downloadFile(JSON.stringify({...componentId, config}, null, 2), 'application/json', 'config-download-link');
  };

  /** Generate and download component css variable file */
  const exportStyling = () => {
    const regexp = new RegExp(`^${STYLING_PREFIX}`);
    const { args, initialArgs }: { args: Record<string, any> | undefined; initialArgs: Record<string, any> | undefined } = api.getCurrentStoryData() as any;
    const diffCss = !args ? {} : Object.entries(args)
      .filter(([key, value]) => regexp.test(key) && typeof value !== 'function' && (!initialArgs || value !== initialArgs[key]))
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key.replace(regexp, '')] = value;
        return acc;
      }, {});
    const css = generateThemeCss(diffCss);
    downloadFile(css, 'text/css', 'styling-download-link');
  };

  addons.add(`${ADDON_ID}/exporter`, {
    type: types.TOOL,
    title: 'Otter Export',
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => {
      return <ExporterToolbar onExportTheme={exportTheme} onExportConfig={exportConfig} onExportStyling={exportStyling}/>;
    }
  });

});
