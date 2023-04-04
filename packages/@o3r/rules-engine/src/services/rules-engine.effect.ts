import {Injectable, Optional} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {
  cancelPlaceholderTemplateRequest,
  deletePlaceholderTemplateEntity,
  failPlaceholderTemplateEntity, PlaceholderTemplateReply,
  PlaceholderVariable,
  setPlaceholderTemplateEntity,
  setPlaceholderTemplateEntityFromUrl
} from '@o3r/components';
import {fromApiEffectSwitchMapById} from '@o3r/core';
import {DynamicContentService} from '@o3r/dynamic-content';
import {LocalizationService} from '@o3r/localization';
import {combineLatest, EMPTY, firstValueFrom, Observable, of} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {RulesEngineService} from './rules-engine.service';
import {JSONPath} from 'jsonpath-plus';

/**
 * Service to handle async PlaceholderTemplate actions
 */
@Injectable()
export class PlaceholderTemplateResponseEffect {

  public setPlaceholderTemplateEntityFromCall$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPlaceholderTemplateEntityFromUrl, deletePlaceholderTemplateEntity),
      fromApiEffectSwitchMapById(
        (templateResponse: PlaceholderTemplateReply, action) => {
          if (action.type === '[PlaceholderTemplate] delete entity') {
            return EMPTY;
          }
          const facts = templateResponse.vars ? Object.values(templateResponse.vars).filter((variable: PlaceholderVariable) => variable.type === 'fact') : [];
          const factsStreamsList = facts.map((fact) =>
            this.rulesEngineService.engine.retrieveOrCreateFactStream(fact.value).pipe(map((factValue) => ({
              name: fact.value, factValue
            }))));
          return (factsStreamsList.length ? combineLatest(factsStreamsList) : of([])).pipe(
            switchMap((allFacts) => {
              return this.getRenderedHTML$(templateResponse.template, templateResponse.vars, allFacts).pipe(
                map(({renderedTemplate, unknownTypeFound}) => setPlaceholderTemplateEntity({
                  entity: {
                    ...templateResponse,
                    resolvedUrl: action.resolvedUrl,
                    id: action.id,
                    url: action.url,
                    requestIds: [action.requestId],
                    renderedTemplate,
                    unknownTypeFound
                  },
                  requestId: action.requestId
                }))
              );
            }));
        },
        ((error, action) => of(failPlaceholderTemplateEntity({
          ids: [action.id],
          error: error,
          requestId: action.requestId
        }))),
        (requestIdPayload, action) => cancelPlaceholderTemplateRequest({...requestIdPayload, id: action.id})
      )
    )
  );

  constructor(
    private actions$: Actions,
    private rulesEngineService: RulesEngineService,
    private dynamicContentService: DynamicContentService,
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
