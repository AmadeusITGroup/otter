import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CssMetadata } from '../core/index';

@Injectable()
export class OtterStylingDevtools {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  public getStylingMetadata(stylingMetadataPath: string) {
    return firstValueFrom(this.http.get<CssMetadata>(stylingMetadataPath));
  }

  public updateVariables(variables: Record<string, string>) {
    Object.entries(variables).forEach(([varName, value]) => this.document.querySelector('html')!.style.setProperty(`--${varName}`, value));
  }
}
