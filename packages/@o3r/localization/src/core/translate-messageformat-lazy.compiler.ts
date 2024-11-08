import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
} from '@angular/core';
import {
  TranslateCompiler,
} from '@ngx-translate/core';
import {
  IntlMessageFormat,
  Options,
} from 'intl-messageformat';

/**
 * Options for Lazy Message Format compiler
 */
export interface LazyMessageFormatConfig extends Options {
  /**
   * Enables compiled translation caching
   * @default true
   */
  enableCache?: boolean;

  /**
   * Enables HTML in translation
   * @default true
   */
  ignoreTag?: boolean;
}

/**
 * Message format configuration default value
 */
export const lazyMessageDefaultConfig: LazyMessageFormatConfig = {
  enableCache: true,
  ignoreTag: true
};

/** Message Format configuration Token */
export const MESSAGE_FORMAT_CONFIG = new InjectionToken<LazyMessageFormatConfig>('Message Format configuration');

/**
 * This compiler expects ICU syntax and compiles the expressions with messageformat.js
 * Compare to ngx-translate-messageformat-compiler package, the compilation of the translation is done only on demand
 */
@Injectable()
export class TranslateMessageFormatLazyCompiler extends TranslateCompiler {
  /** Configuration */
  private readonly config: LazyMessageFormatConfig;

  /** Cache of compiled translations */
  private cache: { [x: string]: IntlMessageFormat } = {};

  constructor(@Optional() @Inject(MESSAGE_FORMAT_CONFIG) config?: LazyMessageFormatConfig) {
    super();

    this.config = config ? { ...lazyMessageDefaultConfig, ...config } : lazyMessageDefaultConfig;
  }

  /**
   * Clear the cache of the compiled translations
   */
  public clearCache() {
    this.cache = {};
  }

  /** @inheritDoc */
  public compile(value: string, lang: string): (params: any) => string {
    return (params: any) => (new IntlMessageFormat(value, lang, undefined, this.config).format(params) as string);
  }

  /** @inheritDoc */
  public compileTranslations(translations: { [x: string]: any }, lang: string) {
    type CompiledTranslationMap = { [key in keyof typeof translations]: (params: any) => string };

    const compilingStrategy = this.config.enableCache
      ? (acc: CompiledTranslationMap, key: string) => {
        acc[key] = (params: any) => {
          const cached = this.cache[`${lang}_${key}`];
          if (cached) {
            return cached.format(params) as string;
          }

          const newCachedItem = new IntlMessageFormat(translations[key], lang, undefined, this.config);
          this.cache[`${lang}_${key}`] = newCachedItem;
          return newCachedItem.format(params) as string;
        };
        return acc;
      }

      : (acc: CompiledTranslationMap, key: string) => {
        acc[key] = (params: any) => new IntlMessageFormat(translations[key], lang, undefined, this.config).format(params) as string;
        return acc;
      };

    return Object.keys(translations).reduce<CompiledTranslationMap>((acc, key) => compilingStrategy(acc, key), {});
  }
}
