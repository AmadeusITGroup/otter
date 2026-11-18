/**
 * Model: Paint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { GradientPaint } from '../gradient-paint';
import { ImagePaint } from '../image-paint';
import { PatternPaint } from '../pattern-paint';
import { SolidPaint } from '../solid-paint';

export type Paint = GradientPaint | ImagePaint | PatternPaint | SolidPaint;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['SOLID', 'GRADIENT_LINEAR', 'GRADIENT_RADIAL', 'GRADIENT_ANGULAR', 'GRADIENT_DIAMOND', 'IMAGE', 'PATTERN'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'PATTERN';
/** Array of ScaleModeEnum items */
export const LIST_SCALE_MODE_ENUM = ['FILL', 'FIT', 'TILE', 'STRETCH'] as const;

/** List of available values for ScaleModeEnum */
export type ScaleModeEnum = 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
/** Array of TileTypeEnum items */
export const LIST_TILE_TYPE_ENUM = ['RECTANGULAR', 'HORIZONTAL_HEXAGONAL', 'VERTICAL_HEXAGONAL'] as const;

/** List of available values for TileTypeEnum */
export type TileTypeEnum = 'RECTANGULAR' | 'HORIZONTAL_HEXAGONAL' | 'VERTICAL_HEXAGONAL';
/** Array of HorizontalAlignmentEnum items */
export const LIST_HORIZONTAL_ALIGNMENT_ENUM = ['START', 'CENTER', 'END'] as const;

/** List of available values for HorizontalAlignmentEnum */
export type HorizontalAlignmentEnum = 'START' | 'CENTER' | 'END';
/** Array of VerticalAlignmentEnum items */
export const LIST_VERTICAL_ALIGNMENT_ENUM = ['START', 'CENTER', 'END'] as const;

/** List of available values for VerticalAlignmentEnum */
export type VerticalAlignmentEnum = 'START' | 'CENTER' | 'END';

