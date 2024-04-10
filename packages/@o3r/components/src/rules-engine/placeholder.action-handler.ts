import { Injectable } from '@angular/core';
import type { RulesEngineActionHandler } from '@o3r/core';
import { ActionUpdatePlaceholderBlock, RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE } from './placeholder.interfaces';
import { PlaceholderService } from '@o3r/components';

/**
 * Service to handle async PlaceholderTemplate actions
 */
@Injectable()
export class PlaceholderRulesEngineActionHandler implements RulesEngineActionHandler<ActionUpdatePlaceholderBlock>{

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_PLACEHOLDER_UPDATE_ACTION_TYPE] as const;

  constructor(private readonly placeholderService: PlaceholderService) {
  }

  /** @inheritdoc */
  public executeActions(actions: ActionUpdatePlaceholderBlock[]) {
    this.placeholderService.updatePlaceholderTemplateUrls(actions);
  }
}
