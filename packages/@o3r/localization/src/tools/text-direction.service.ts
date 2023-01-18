import { Directionality } from '@angular/cdk/bidi';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LocalizationConfiguration } from '../core';
import { LOCALIZATION_CONFIGURATION_TOKEN } from './localization.token';

/**
 * Service for handling the text direction based on the LocalizationConfiguration
 */
@Injectable()
export class TextDirectionService {
  private subscription?: Subscription;
  private renderer: Renderer2;

  constructor(
    private translateService: TranslateService,
    @Inject(LOCALIZATION_CONFIGURATION_TOKEN) private configuration: LocalizationConfiguration,
    private rendererFactory: RendererFactory2,
    private directionality: Directionality) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Updates the dir attribute on body HTML tag.
   *
   * @returns a subscription that updates the dir attribute
   */
  public onLangChangeSubscription() {
    if (this.subscription && !this.subscription.closed) {
      return this.subscription;
    }
    this.subscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      const direction = this.configuration.rtlLanguages.indexOf(event.lang.split('-')[0]) > -1 ? 'rtl' : 'ltr';
      this.renderer.setAttribute(document.body, 'dir', direction);
      this.directionality.change.emit(direction);
    });
    return this.subscription;
  }
}
