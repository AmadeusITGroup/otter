import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  cancelPlaceholderTemplateRequest,
  deletePlaceholderTemplateEntity,
  failPlaceholderTemplateEntity, PlaceholderTemplateReply,
  PlaceholderVariable,
  setPlaceholderTemplateEntity,
  setPlaceholderTemplateEntityFromUrl
} from '@o3r/components';
import { fromApiEffectSwitchMapById } from '@o3r/core';
import { DynamicContentService } from '@o3r/dynamic-content';
import { combineLatest, EMPTY, firstValueFrom, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RulesEngineService } from './rules-engine.service';

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
              return from(this.renderHTML(templateResponse.template, templateResponse.vars, allFacts)).pipe(
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

  constructor(private actions$: Actions, private rulesEngineService: RulesEngineService, private dynamicContentService: DynamicContentService) {
  }

  /**
   * Renders the html template, replacing facts and urls
   *
   * @param template
   * @param vars
   * @param facts
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
            default :
              unknownTypeFound = true;
              break;
          }
        }
      }
    }
    return {renderedTemplate: template, unknownTypeFound};
  }

}


