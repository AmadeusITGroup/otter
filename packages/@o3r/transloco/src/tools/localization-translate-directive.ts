import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  TranslocoDirective,
} from '@jsverse/transloco';
import {
  Subscription,
} from 'rxjs';
import {
  LocalizationConfiguration,
} from '../core';
import {
  getDebugKey,
} from './localization-helpers';
import {
  LocalizationService,
} from './localization-service';
import {
  LOCALIZATION_CONFIGURATION_TOKEN,
} from './localization-token';

/**
 * TranslocoDirective class adding debug functionality.
 *
 * Extends the TranslocoDirective from Transloco to add:
 * - Key mapping via LocalizationService (override store)
 * - Show keys mode (display raw keys instead of translations)
 * - Debug mode (display key alongside translation)
 *
 * For the structural strategy (`*transloco`), the debug/showKeys behavior is handled
 * by overriding `getTranslateFn`.
 *
 * For the attribute strategy (`[transloco]="key"`), the parent's private `attributeStrategy()`
 * sets `innerText` directly. Since we cannot override this private method, we apply
 * debug/showKeys transformations by overwriting `innerText` immediately after calling
 * `super.ngOnInit()` and `super.ngOnChanges()`, in the same call stack.
 */
@Directive({
  selector: '[transloco]',
  standalone: false
})
export class LocalizationTranslateDirective extends TranslocoDirective implements OnInit, OnChanges {
  private readonly localizationService = inject(LocalizationService);
  private readonly localizationConfig = inject<LocalizationConfiguration>(LOCALIZATION_CONFIGURATION_TOKEN);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly hostElement = inject(ElementRef);
  private readonly hostRenderer = inject(Renderer2);
  private readonly isAttributeStrategy = inject(TemplateRef, { optional: true }) === null;
  private readonly o3rDestroyRef = inject(DestroyRef);

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
  public set transloco(key: string) {
    if (key && key !== this.key) {
      this.onKeyChange?.unsubscribe();
      this.onKeyChange = this.localizationService.getKey(key)
        .pipe(takeUntilDestroyed(this.o3rDestroyRef))
        .subscribe((newKey) => {
          const previousKey = this.key;
          this.key = newKey;
          this.changeDetectorRef.markForCheck();
          super.ngOnChanges({ transloco: new SimpleChange(previousKey, newKey, !previousKey) });
        });
    }
  }

  constructor() {
    super();
    if (this.localizationConfig.enableTranslationDeactivation) {
      this.localizationService.showKeys$.pipe(takeUntilDestroyed(this.o3rDestroyRef)).subscribe((showKeys) => {
        this.showKeys = showKeys;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * For the attribute strategy, overwrites `innerText` with the debug/showKeys value
   * immediately after the parent has set it.
   */
  private applyAttributeDebug() {
    if (!this.isAttributeStrategy || !this.key) {
      return;
    }
    if (this.showKeys) {
      this.hostRenderer.setProperty(this.hostElement.nativeElement, 'innerText', this.key);
    } else if (this.localizationConfig.debugMode) {
      this.hostRenderer.setProperty(
        this.hostElement.nativeElement,
        'innerText',
        getDebugKey(this.key, this.hostElement.nativeElement.innerText as string)
      );
    }
  }

  /**
   * Override getTranslateFn to plug debug/showKeys for the structural strategy.
   * @param lang Current language
   * @param prefix Scope prefix
   */
  protected override getTranslateFn(lang: string, prefix: string | undefined): (key: string, params?: Record<string, unknown>) => any {
    const parentTranslateFn = super.getTranslateFn(lang, prefix);
    return (key: string, params?: Record<string, unknown>) => {
      if (this.showKeys) {
        return key;
      }
      const value = parentTranslateFn(key, params);
      if (this.localizationConfig.debugMode) {
        return getDebugKey(key, value as string);
      }
      return value;
    };
  }

  /** @inheritdoc */
  public override ngOnInit() {
    super.ngOnInit();
    this.applyAttributeDebug();
  }

  /** @inheritdoc */
  public override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    this.applyAttributeDebug();
  }
}
