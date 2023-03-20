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
import {combineLatest, EMPTY, firstValueFrom, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, switchMap, take} from 'rxjs/operators';
import {RulesEngineService} from './rules-engine.service';
import {Store} from '@ngrx/store';
import {JSONPath} from 'jsonpath-plus';

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
          const factsStreamsList = facts.map((fact) =>
            this.rulesEngineService.engine.retrieveOrCreateFactStream(fact.value).pipe(map((factValue) => ({
              name: fact.value, factValue
            }))));
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
    private actions$: Actions,
    private rulesEngineService: RulesEngineService,
    private dynamicContentService: DynamicContentService,
    private store: Store<PlaceholderRequestStore>,
    @Optional() private translationService?: LocalizationService) {
  }

  /**
   * Renders the html template, replacing facts and urls and localizationKeys
   *
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
    const replacements$: Observable<{ ejsVar: RegExp; value: string }>[] = [];
    if (vars && template) {
      for (const varName in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, varName)) {
          const ejsVar = new RegExp(`<%=\\s*${varName}\\s*%>`, 'g');
          switch (vars[varName].type) {
            case 'relativeUrl': {
              replacements$.push(
                this.dynamicContentService.getMediaPathStream(vars[varName].value).pipe(
                  take(1),
                  map((value: string) => ({ejsVar, value}))
                )
              );
              break;
            }
            case 'fullUrl': {
              template = template.replace(ejsVar, vars[varName].value);
              break;
            }
            case 'fact': {
              const factValue = factset[vars[varName].value] || '';
              // eslint-disable-next-line new-cap
              const resolvedFactValue = vars[varName].path ? factValue && JSONPath({wrap: false, json: factValue, path: vars[varName].path!}) : factValue;
              template = template.replace(ejsVar, resolvedFactValue);
              break;
            }
            case 'localisation': {
              const linkedParams = (vars[varName].vars || []).reduce((acc: { [key: string]: any }, parameter) => {
                const paramName = vars[parameter].value;
                acc[paramName] = factset[paramName];
                return acc;
              }, {});
              if (this.translationService) {
                replacements$.push(
                  this.translationService.translate(vars[varName].value, linkedParams).pipe(
                    map((value: string) => ({ejsVar, value}))
                  )
                );
              }
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
        map((replacements: { ejsVar: RegExp; value: string }[]) => ({
          renderedTemplate: replacements.reduce((acc, replacement) =>
            acc.replace(replacement.ejsVar, replacement.value), template!
          ),
          unknownTypeFound
        }))
      ) : of({renderedTemplate: template, unknownTypeFound});
  }

  /**
   * Renders the html template, replacing facts and urls
   *
   * @param template
   * @param vars
   * @param facts
   * @deprecated will be removed in v10
   */
  public async renderHTML(template?: string, vars?: Record<string, PlaceholderVariable>, facts?: { name: string; factValue: any }[]) {
    let unknownTypeFound = false;
    if (vars && template) {
      for (const varName in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, varName)) {
          const ejsVar = new RegExp(`<%=\\s*${varName}\\s*%>`, 'g');
          switch (vars[varName].type) {
            case 'relativeUrl': {
              const url = await firstValueFrom(this.dynamicContentService.getMediaPathStream(vars[varName].value));
              template = template.replace(ejsVar, url);
              break;
            }
            case 'fullUrl': {
              template = template.replace(ejsVar, vars[varName].value);
              break;
            }
            case 'fact': {
              const fact = facts ? facts.find((el) => el.name === varName) : undefined;
              template = template.replace(ejsVar, fact ? fact.factValue : '');
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
    return {renderedTemplate: template, unknownTypeFound};
  }
}
