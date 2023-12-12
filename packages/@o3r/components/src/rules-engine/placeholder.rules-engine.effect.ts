import {Injectable, Optional} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {
  cancelPlaceholderRequest,
  failPlaceholderRequestEntity,
  PlaceholderRequestStore,
  PlaceholderVariable,
  selectPlaceholderRequestEntityUsage,
  setPlaceholderRequestEntityFromUrl,
  updatePlaceholderRequestEntity
} from '@o3r/components';
import {fromApiEffectSwitchMapById} from '@o3r/core';
import {DynamicContentService} from '@o3r/dynamic-content';
import {LocalizationService} from '@o3r/localization';
import {RulesEngineRunnerService} from '@o3r/rules-engine';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, switchMap, take} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import { JSONPath } from 'jsonpath-plus';

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
          const facts = templateResponse.vars ? Object.values(templateResponse.vars).filter((variable: PlaceholderVariable) => variable.type === 'fact') : [];
          const factsStreamsList = this.rulesEngineService ? facts.map((fact) =>
            this.rulesEngineService!.engine.retrieveOrCreateFactStream(fact.value).pipe(
              map((factValue) => ({
                name: fact.value,
                // eslint-disable-next-line new-cap
                factValue: (fact.path && factValue) ? JSONPath({ wrap: false, json: factValue, path: fact.path }) : factValue
              })),
              distinctUntilChanged((previous, current) => previous.factValue === current.factValue)
            )) : [];

          const factsStreamsList$ = factsStreamsList.length ? combineLatest(factsStreamsList) : of([]);
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
    @Optional() private readonly rulesEngineService: RulesEngineRunnerService | null,
    @Optional() private readonly dynamicContentService: DynamicContentService | null,
    @Optional() private readonly translationService: LocalizationService | null) {
  }

  /**
   * Renders the html template, replacing facts and urls and localizationKeys
   * @param template
   * @param vars
   * @param facts
   */
  private getRenderedHTML$(template?: string, vars?: Record<string, PlaceholderVariable>, facts?: { name: string; factValue: any }[]) {
    let unknownTypeFound = false;
    const factset = (facts || []).reduce((set: { [key: string]: any }, fact) => {
      set[fact.name] = fact.factValue;
      return set;
    }, {});
    const replacements$: Observable<{ ejsVar: RegExp; value: string } | null>[] = [];
    if (vars && template) {
      for (const varName in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, varName)) {
          const ejsVar = new RegExp(`<%=\\s*${varName}\\s*%>`, 'g');
          switch (vars[varName].type) {
            case 'relativeUrl': {
              replacements$.push(
                this.dynamicContentService?.getMediaPathStream(vars[varName].value).pipe(
                  take(1),
                  map((value: string) => ({ejsVar, value}))
                ) || of({ ejsVar, value: vars[varName].value })
              );
              break;
            }
            case 'fullUrl': {
              template = template.replace(ejsVar, vars[varName].value);
              break;
            }
            case 'fact': {
              template = template.replace(ejsVar, factset[vars[varName].value] ?? '');
              break;
            }
            case 'localisation': {
              const linkedParams = (vars[varName].vars || []).reduce((acc: { [key: string]: any }, parameter) => {
                const paramName = vars[parameter].value;
                acc[paramName] = factset[paramName];
                return acc;
              }, {});
              replacements$.push(
                this.translationService ?
                  this.translationService.translate(vars[varName].value, linkedParams).pipe(
                    map((value) => (value ? { ejsVar, value } : null))
                  ) :
                  of(null)
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
          renderedTemplate: replacements.reduce((acc, replacement) =>
            replacement ? acc.replace(replacement.ejsVar, replacement.value) : acc,
            template!
          ),
          unknownTypeFound
        }))
      ) : of({renderedTemplate: template, unknownTypeFound});
  }
}
