import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  TranslateDirective,
  TranslateService,
} from '@ngx-translate/core';
import {
  Subscription,
} from 'rxjs';
import {
  LocalizationConfiguration,
} from '../core';
import {
  LocalizationService,
} from './localization.service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
} from './localization.token';
/**
 * TranslateDirective class adding debug functionality
 */
@Directive({
  selector: '[translate],[ngx-translate]',
  standalone: false
})
export class LocalizationTranslateDirective extends TranslateDirective implements OnDestroy {
  private readonly localizationService = inject(LocalizationService);
  private readonly localizationConfig = inject<LocalizationConfiguration>(LOCALIZATION_CONFIGURATION_TOKEN);

  /**
   * Internal subscription to the LocalizationService showKeys mode changes
   */
  private readonly onShowKeysChange?: Subscription;

  /**
   * Should we display keys instead of translations
   */
  private showKeys = false;

  /**
   * Internal subscription to the LocalizationService key mapping
   */
  private onKeyChange?: Subscription;

  /** @inheritdoc */
  @Input()
  public set translate(key: string) {
    if (key && key !== this.key) {
      if (this.onKeyChange) {
        this.onKeyChange.unsubscribe();
      }
      this.onKeyChange = this.localizationService.getKey(key).subscribe((newKey) => {
        this.key = newKey;
        this.checkNodes();
      });
    }
  }

  constructor() {
    const translateService = inject(TranslateService);
    const element = inject(ElementRef);
    const ref = inject(ChangeDetectorRef);

    super(translateService, element, ref);
    const localizationService = this.localizationService;
    const localizationConfig = this.localizationConfig;

    if (localizationConfig.enableTranslationDeactivation) {
      this.onShowKeysChange = localizationService.showKeys$.subscribe((showKeys) => {
        this.showKeys = showKeys;
        this.checkNodes(true);
      });
    }
  }

  /**
   * Overriding parent's setContent to plug debugging feature
   * @param node
   * @param content
   */
  public setContent(node: any, content: string): void {
    const key = node.originalContent;
    const newContent = this.showKeys ? key : (this.localizationConfig.debugMode && key ? `${key as string} - ${content}` : content);
    if (typeof node.textContent !== 'undefined' && node.textContent !== null) {
      node.textContent = newContent;
    } else {
      node.data = newContent;
    }
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    if (this.onShowKeysChange) {
      this.onShowKeysChange.unsubscribe();
    }
    if (this.onKeyChange) {
      this.onKeyChange?.unsubscribe();
    }
  }
}
