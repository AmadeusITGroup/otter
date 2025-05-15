/**
 * Model: VariableScope
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Scopes allow a variable to be shown or hidden in the variable picker for various fields. This declutters the Figma UI if you have a large number of variables. Variable scopes are currently supported on `FLOAT`, `STRING`, and `COLOR` variables.  `ALL_SCOPES` is a special scope that means that the variable will be shown in the variable picker for all variable fields. If `ALL_SCOPES` is set, no additional scopes can be set.  `ALL_FILLS` is a special scope that means that the variable will be shown in the variable picker for all fill fields. If `ALL_FILLS` is set, no additional fill scopes can be set.  Valid scopes for `FLOAT` variables: - `ALL_SCOPES` - `TEXT_CONTENT` - `WIDTH_HEIGHT` - `GAP` - `STROKE_FLOAT` - `EFFECT_FLOAT` - `OPACITY` - `FONT_WEIGHT` - `FONT_SIZE` - `LINE_HEIGHT` - `LETTER_SPACING` - `PARAGRAPH_SPACING` - `PARAGRAPH_INDENT`  Valid scopes for `STRING` variables: - `ALL_SCOPES` - `TEXT_CONTENT` - `FONT_FAMILY` - `FONT_STYLE`  Valid scopes for `COLOR` variables: - `ALL_SCOPES` - `ALL_FILLS` - `FRAME_FILL` - `SHAPE_FILL` - `TEXT_FILL` - `STROKE_COLOR` - `EFFECT_COLOR`
 */
export type VariableScope = 'ALL_SCOPES' | 'TEXT_CONTENT' | 'CORNER_RADIUS' | 'WIDTH_HEIGHT' | 'GAP' | 'ALL_FILLS' | 'FRAME_FILL' | 'SHAPE_FILL' | 'TEXT_FILL' | 'STROKE_COLOR' | 'STROKE_FLOAT' | 'EFFECT_FLOAT' | 'EFFECT_COLOR' | 'OPACITY' | 'FONT_FAMILY' | 'FONT_STYLE' | 'FONT_WEIGHT' | 'FONT_SIZE' | 'LINE_HEIGHT' | 'LETTER_SPACING' | 'PARAGRAPH_SPACING' | 'PARAGRAPH_INDENT' | 'FONT_VARIATIONS';
