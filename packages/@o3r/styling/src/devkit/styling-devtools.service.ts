import {
  DOCUMENT
} from '@angular/common';
import {
  inject,
  Injectable
} from '@angular/core';
import type {
  CssMetadata
} from '../core/index';

/**
 * Styling devtools service
 */
@Injectable()
export class OtterStylingDevtools {
  private readonly document = inject(DOCUMENT);

  /**
   * Retrieve styling metadata
   * @param stylingMetadataPath
   */
  public async getStylingMetadata(stylingMetadataPath: string): Promise<CssMetadata> {
    return (await fetch(stylingMetadataPath)).json();
  }

  /**
   * Update styling variables
   * @param variables
   */
  public updateVariables(variables: Record<string, string>) {
    Object.entries(variables).forEach(([varName, value]) => this.document.querySelector('html')!.style.setProperty(`--${varName}`, value));
  }

  /**
   * Reset styling variables override
   */
  public resetStylingVariables() {
    const style = this.document.querySelector('html')!.style;
    style.cssText
      .split(/;(\s+)?/)
      .reduce((acc: string[], str) => {
        const match = str?.match(/^(--.*):/);
        return match ? acc.concat(match[1]) : acc;
      }, [])
      .forEach((varName) => style.removeProperty(varName));
  }
}
