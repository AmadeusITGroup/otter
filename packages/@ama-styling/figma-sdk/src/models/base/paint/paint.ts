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

export type TypeEnum = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'PATTERN';
export type ScaleModeEnum = 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
export type TileTypeEnum = 'RECTANGULAR' | 'HORIZONTAL_HEXAGONAL' | 'VERTICAL_HEXAGONAL';
export type HorizontalAlignmentEnum = 'START' | 'CENTER' | 'END';
export type VerticalAlignmentEnum = 'START' | 'CENTER' | 'END';

