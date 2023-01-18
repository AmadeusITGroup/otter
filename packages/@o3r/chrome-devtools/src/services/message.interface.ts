import type { AvailableApplicationMessageContents } from '@o3r/application';
import type { AvailableComponentsMessageContents } from '@o3r/components';
import type { AvailableConfigurationMessageContents } from '@o3r/configuration';
import type { CommonContentMessages } from '@o3r/core';
import type { AvailableLocalizationMessageContents } from '@o3r/localization';
import type { AvailableRulesEngineMessageContents } from '@o3r/rules-engine';

export type AvailableMessageContents =
  | AvailableComponentsMessageContents
  | AvailableConfigurationMessageContents
  | AvailableLocalizationMessageContents
  | AvailableRulesEngineMessageContents
  | AvailableApplicationMessageContents
  | CommonContentMessages;

