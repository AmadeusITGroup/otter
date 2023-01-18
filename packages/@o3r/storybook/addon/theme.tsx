// eslint-disable-next-line no-use-before-define
import { Form, Icons, TooltipLinkList, WithTooltip } from '@storybook/components';
import Color from 'color';
import React, { ChangeEvent } from 'react';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { downloadFile, generateThemeCss } from './helpers';

/**
 * Determine if the given value is a color
 *
 * @param value value to analyze
 */
const isColor = (value: string) => {
  return /^rgba?\([^)]*\)$/.test(value) || /^#([a-f]|[0-9]){3,8}$/.test(value);
};

/** Theme component properties */
export interface ThemePanelProps {
  /** Theme variable map */
  theme: Record<string, string>;
  /** Initial theme value */
  baseTheme: Record<string, string>;
  /** Current theme name */
  themeName?: string;
  /** List of themes */
  themeNameList?: string[];

  /** On theme variable value change event */
  onThemeChange: (theme: Record<string, string>) => void;
  /** On theme change event */
  onThemeNameChange: (theme: string) => void;
  /** On theme import event */
  onThemeImport: (theme: Record<string, string>) => void;
}

const CSS_PARSING_REGEXP = /:root *[^{]* *\{\r?\n?(([^}]|[\r\n])*)\}/g;

/** Theme component from Storybook panel */
export default class ThemePanel extends React.Component<ThemePanelProps> {

  private themeChange$ = new Subject<{ name: string; value: string }>();
  private subscriptions = new Subscription();

  /**
   * Request update CSS Variable value
   *
   * @param name CSS variable name to update
   * @param value new CSS variable value
   */
  private handleValueChange(name: string, value: string) {
    this.themeChange$.next({ name, value });
  }

  /**
   * Parse CSS file content to extract variable map
   *
   * @param css CSS file content
   */
  private parseCssFile(css: string): Record<string, string> | undefined {
    const result: Record<string, string> = {};
    let found: RegExpExecArray | null = null;
    while ((found = CSS_PARSING_REGEXP.exec(css)) !== null) {
      found[1]
        ?.split(/;[\r\n]*/)
        .map((line) => line.trim().split(':').map((item) => item.trim()))
        .filter(([variable]) => variable.startsWith('--'))
        .forEach(([variable, value]) => {
          result[variable.replace(/^--/, '')] = value;
        });
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Update CSS Variable value
   *
   * @param name CSS variable name to update
   * @param value new CSS variable value
   */
  private updateValue(name: string, value: string) {
    const theme = {
      ...this.props.theme,
      [name]: value
    };
    this.props.onThemeChange(theme);
  }

  /** Reset theme variable to the default value */
  public resetTheme() {
    this.props.onThemeChange(this.props.baseTheme);
  }

  /** Export CSS file */
  public exportTheme() {
    const css = generateThemeCss(this.props.theme, this.props.baseTheme);
    downloadFile(css, 'text/css', 'theme-download-link');
  }

  /**
   * Import CSS file to apply as application theme
   *
   * @param file CSS File to load
   */
  public importTheme(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const target = e.target;
      const data = target?.result;
      const fileContent = data?.toString();
      const parsedData = fileContent && this.parseCssFile(fileContent);
      if (parsedData) {
        this.props.onThemeImport(parsedData);
      }
    };
    reader.readAsText(file);
  }

  /** @inheritdoc */
  public componentDidMount() {
    this.subscriptions.add(
      this.themeChange$.pipe(
        debounceTime(300)
      ).subscribe(({ name, value }) => this.updateValue(name, value))
    );
  }

  /** @inheritdoc */
  public componentWillUnmount() {
    this.subscriptions.unsubscribe();
  }

  /** @inheritdoc */
  public render() {

    const buttonMargin = { margin: '0 .25em' };

    return (
      <table className="docblock-argstable css-1wrtoif">
        <thead className="docblock-argstable-head">
          <tr>
            <th>Name</th>
            <th style={{ display: 'flex', justifyContent: 'space-between' }}>
              Value
              <div>
                <div style={{ float: 'left' }}>
                  <label htmlFor="importedTheme">Import Theme: </label>
                  <Form.Input
                    type="file"
                    id="importedTheme"
                    accept=".css"
                    onChange={(e: any) => this.importTheme((e.target as HTMLInputElement).files?.[0])}></Form.Input>
                </div>
                {this.props.themeNameList && this.props.themeNameList.length > 1 && (
                  <WithTooltip
                    placement="top"
                    trigger="click"
                    closeOnClick
                    tooltip={() => {
                      return (
                        <TooltipLinkList links={
                          this.props.themeNameList!.map((themeName) => ({
                            id: `select-theme-${themeName}`,
                            title: themeName,
                            right: this.props.themeName === themeName ? <Icons icon="check" /> : undefined,
                            onClick: () => this.props.onThemeNameChange(themeName)
                          }))
                        } />
                      );
                    }}
                  >
                    <Form.Button title="Switch Theme" style={buttonMargin}>
                      <Icons icon="paintbrush" />
                    </Form.Button>
                  </WithTooltip>
                )}
                <Form.Button style={buttonMargin} title="Export theme" onClick={() => this.exportTheme()}><Icons icon="download"></Icons></Form.Button>
                <Form.Button style={buttonMargin} title="Reset theme" onClick={() => this.resetTheme()}><Icons icon="delete"></Icons></Form.Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(this.props.theme).map(([name, value]) => (
              <tr key={name + '--row'}>
                <td style={{ fontWeight: 'bold' }} key={name + '--name'}>{name}</td>
                <td key={name + '--value'}>
                  <Form.Input
                    type={isColor(this.props.theme[name]) ? 'color' : 'text'}
                    value={isColor(this.props.theme[name]) ? new Color(value).hex() : value}
                    key={name}
                    style={{ display: 'inline-block' }}
                    onChange={isColor(this.props.theme[name]) ? (e: ChangeEvent<HTMLInputElement>) => this.handleValueChange(name, e.target.value) : (e: ChangeEvent<HTMLInputElement>) => this.updateValue(name, e.target.value)} />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}
