import {Injectable, Injector, type ProviderToken} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {
  cancelPlaceholderRequest,
  failPlaceholderRequestEntity,
  PlaceholderRequestStore,
  PlaceholderVariable,
  selectPlaceholderRequestEntityUsage,
  setPlaceholderRequestEntityFromUrl,
  updatePlaceholderRequestEntity
} from '../placeholder-request';
import {fromApiEffectSwitchMapById} from '@o3r/core';
import {combineLatest, EMPTY, from, Observable, of} from 'rxjs';
import {catchError, distinctUntilChanged, map, switchMap, take} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import { LoggerService } from '@o3r/logger';
import type { Facts, RulesEngineRunnerService } from '@o3r/rules-engine';
import type { DynamicContentService } from '@o3r/dynamic-content';
import type { JSONPath } from 'jsonpath-plus';
import type { LocalizationService } from '@o3r/localization';

/**
 * Service to handle async PlaceholderTemplate actions
 */
@Injectable()
export class PlaceholderTemplateResponseEffect {
  /**
   * Set the PlaceholderRequest entity with the reply content, dispatch failPlaceholderRequestEntity if it catches a failure
   * Handles the rendering of the HTML content from the template and creates the combine latest from facts list if needed
   * Disables unused templates refresh if used is false in the store
   */
  public setPlaceholderRequestEntityFromUrl$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPlaceholderRequestEntityFromUrl),
      fromApiEffectSwitchMapById(
        (templateResponse, action) => {
          const facts = templateResponse.vars ? Object.entries(templateResponse.vars).filter(([, variable]) => variable.type === 'fact') : [];
          const factsStreamsList$ = from(import(/* @vite-ignore */ `${'@o3r/rules-engine'}`)).pipe(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            switchMap(({ RulesEngineRunnerService }: { RulesEngineRunnerService: ProviderToken<RulesEngineRunnerService> }) => {
              const engine = this.injector.get(RulesEngineRunnerService, null, {optional: true})?.engine;
              return engine && facts.length ? combineLatest(
                facts.map(([varName, fact]) =>
                  engine.retrieveOrCreateFactStream(fact.value).pipe(
                    switchMap(async (factValue) => {
                      if (fact.path) {
                        try {
                          // eslint-disable-next-line @typescript-eslint/naming-convention
                          const { JSONPath: jsonPath }: { JSONPath: typeof JSONPath } = await import(/* @vite-ignore */`${'jsonpath-plus'}`);
                          return {
                            varName,
                            factName: fact.value,
                            // eslint-disable-next-line new-cap
                            factValue: factValue ? jsonPath<Facts>({ wrap: false, json: factValue, path: fact.path }) : factValue
                          };
                        } catch {
                          this.logger.error(`The variable ${varName} is based on a fact with Json Path parameter requiring a dependency to 'jsonpath-plus. It should be provided by the application`);
                        }
                      }

                      return {
                        varName,
                        factName: fact.value,
                        factValue
                      };
                    }),
                    distinctUntilChanged((previous, current) => previous.factValue === current.factValue)
                  )
                )
              ) : of([]);
            }),
            catchError(() => of([]))
          );
          return combineLatest([factsStreamsList$, this.store.select(selectPlaceholderRequestEntityUsage(action.id)).pipe(distinctUntilChanged())]).pipe(
            switchMap(([factsUsedInTemplate, placeholderRequestUsage]) => {
              if (!placeholderRequestUsage) {
                return EMPTY;
              }
              return this.getRenderedHTML$(templateResponse.template, templateResponse.vars, factsUsedInTemplate).pipe(
                map(({renderedTemplate, unknownTypeFound}) =>
                  // Update instead of set because used already set by the update from url action
                  updatePlaceholderRequestEntity({
                    entity: {
                      ...templateResponse,
                      resolvedUrl: action.resolvedUrl,
                      id: action.id,
                      renderedTemplate,
                      unknownTypeFound
                    },
                    requestId: action.requestId
                  })
                )
              );
            }));
        },
        (error, action) => of(failPlaceholderRequestEntity({ids: [action.id], error, requestId: action.requestId})),
        (requestIdPayload, action) => cancelPlaceholderRequest({...requestIdPayload, id: action.id})
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<PlaceholderRequestStore>,
    private readonly injector: Injector,
    private readonly logger: LoggerService) {
  }

  /**
   * Renders the html template, replacing facts and urls and localizationKeys
   * @param template
   * @param vars
   * @param facts
   */
  private getRenderedHTML$(template?: string, vars?: Record<string, PlaceholderVariable>, facts?: { varName: string; factName: string; factValue: any }[]) {
    let unknownTypeFound = false;
    const factMap = (facts || []).reduce((mapping: { [key: string]: any }, fact) => {
      mapping[fact.factName] = fact.factValue;
      return mapping;
    }, {});
    const factMapFromVars = (facts || []).reduce((mapping: { [key: string]: any }, fact) => {
      mapping[fact.varName] = fact.factValue;
      return mapping;
    }, {});
    const replacements$: Observable<{ ejsVar: RegExp; value: string } | null>[] = [];
    if (vars && template) {
      for (const varName in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, varName)) {
          const ejsVar = new RegExp(`<%=\\s*${varName}\\s*%>`, 'g');
          switch (vars[varName].type) {
            case 'relativeUrl': {
              replacements$.push(
                from(import(/* @vite-ignore */`${'@o3r/dynamic-content'}`)).pipe(
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  switchMap(({ DynamicContentService }: { DynamicContentService: ProviderToken<DynamicContentService> }) =>
                    this.injector.get(DynamicContentService, null, { optional: true })?.getMediaPathStream(vars[varName].value).pipe(
                      take(1),
                      map((value: string) => ({ ejsVar, value }))
                    ) || of({ ejsVar, value: vars[varName].value })
                  ),
                  catchError(() => of({ ejsVar, value: vars[varName].value }))
                )
              );
              break;
            }
            case 'fullUrl': {
              template = template.replace(ejsVar, vars[varName].value);
              break;
            }
            case 'fact': {
              template = template.replace(ejsVar, factMap[vars[varName].value] ?? '');
              break;
            }
            case 'localisation': {
              const linkedVars = (vars[varName].vars || []).reduce((acc: { [key: string]: any }, parameter) => {
                const paramName = vars[parameter].value;
                acc[paramName] = factMap[paramName];
                return acc;
              }, {});
              const linkedParams = (Object.entries(vars[varName].parameters || {})).reduce((acc: { [key: string]: any }, [paramKey, paramValue]) => {
                acc[paramKey] = factMapFromVars[paramValue];
                return acc;
              }, linkedVars);
              replacements$.push(
                from(import(/* @vite-ignore */`${'@o3r/localization'}`)).pipe(
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  switchMap(({ LocalizationService }: { LocalizationService: ProviderToken<LocalizationService> }) =>
                    this.injector.get(LocalizationService, null, { optional: true })?.translate(vars[varName].value, linkedParams).pipe(
                      map((value) => (value ? { ejsVar, value } : null))
                    ) || of(null)
                  ),
                  catchError(() => of(null))
                )
              );
              break;
            }
            default : {
              unknownTypeFound = true;
              break;
            }
          }
        }
      }
    }
    return replacements$.length > 0 && !!template ?
      combineLatest(replacements$).pipe(
        map((replacements) => ({
          renderedTemplate: replacements.reduce(
            (acc, replacement) =>
              replacement ? acc.replace(replacement.ejsVar, replacement.value) : acc,
            template
          ),
          unknownTypeFound
        }))
      ) : of({renderedTemplate: template, unknownTypeFound});
  }
}
