import type {Configuration} from '@o3r/core';
import {computeItemIdentifier} from '@o3r/core';

export interface DatePickerInputPresConfig extends Configuration {}

export const DATE_PICKER_INPUT_PRES_DEFAULT_CONFIG: DatePickerInputPresConfig = {};

export const DATE_PICKER_INPUT_PRES_CONFIG_ID = computeItemIdentifier('DatePickerInputPresConfig', 'showcase');
