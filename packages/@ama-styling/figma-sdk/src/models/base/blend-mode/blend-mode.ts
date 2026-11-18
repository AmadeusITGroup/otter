/**
 * Model: BlendMode
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * This type is a string enum with the following possible values  Normal blends: - `PASS_THROUGH` (only applicable to objects with children) - `NORMAL`  Darken: - `DARKEN` - `MULTIPLY` - `LINEAR_BURN` - `COLOR_BURN`  Lighten: - `LIGHTEN` - `SCREEN` - `LINEAR_DODGE` - `COLOR_DODGE`  Contrast: - `OVERLAY` - `SOFT_LIGHT` - `HARD_LIGHT`  Inversion: - `DIFFERENCE` - `EXCLUSION`  Component: - `HUE` - `SATURATION` - `COLOR` - `LUMINOSITY`
 */
/** Array of BlendMode items */
export const LIST_BLEND_MODE = ['PASS_THROUGH', 'NORMAL', 'DARKEN', 'MULTIPLY', 'LINEAR_BURN', 'COLOR_BURN', 'LIGHTEN', 'SCREEN', 'LINEAR_DODGE', 'COLOR_DODGE', 'OVERLAY', 'SOFT_LIGHT', 'HARD_LIGHT', 'DIFFERENCE', 'EXCLUSION', 'HUE', 'SATURATION', 'COLOR', 'LUMINOSITY'] as const;

/** List of available values for BlendMode */
export type BlendMode = 'PASS_THROUGH' | 'NORMAL' | 'DARKEN' | 'MULTIPLY' | 'LINEAR_BURN' | 'COLOR_BURN' | 'LIGHTEN' | 'SCREEN' | 'LINEAR_DODGE' | 'COLOR_DODGE' | 'OVERLAY' | 'SOFT_LIGHT' | 'HARD_LIGHT' | 'DIFFERENCE' | 'EXCLUSION' | 'HUE' | 'SATURATION' | 'COLOR' | 'LUMINOSITY';
