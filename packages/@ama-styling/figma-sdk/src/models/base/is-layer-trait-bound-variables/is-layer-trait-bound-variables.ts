/**
 * Model: IsLayerTraitBoundVariables
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { IsLayerTraitBoundVariablesIndividualStrokeWeights } from '../is-layer-trait-bound-variables-individual-stroke-weights';
import { IsLayerTraitBoundVariablesRectangleCornerRadii } from '../is-layer-trait-bound-variables-rectangle-corner-radii';
import { IsLayerTraitBoundVariablesSize } from '../is-layer-trait-bound-variables-size';
import { VariableAlias } from '../variable-alias';

/**
 * A mapping of field to the variables applied to this field. Most fields will only map to a single `VariableAlias`. However, for properties like `fills`, `strokes`, `size`, `componentProperties`, and `textRangeFills`, it is possible to have multiple variables bound to the field.
 */
export interface IsLayerTraitBoundVariables {
  /** @see IsLayerTraitBoundVariablesSize */
  size?: IsLayerTraitBoundVariablesSize;
  /** @see IsLayerTraitBoundVariablesIndividualStrokeWeights */
  individualStrokeWeights?: IsLayerTraitBoundVariablesIndividualStrokeWeights;
  /** @see VariableAlias */
  characters?: VariableAlias;
  /** @see VariableAlias */
  itemSpacing?: VariableAlias;
  /** @see VariableAlias */
  paddingLeft?: VariableAlias;
  /** @see VariableAlias */
  paddingRight?: VariableAlias;
  /** @see VariableAlias */
  paddingTop?: VariableAlias;
  /** @see VariableAlias */
  paddingBottom?: VariableAlias;
  /** @see VariableAlias */
  visible?: VariableAlias;
  /** @see VariableAlias */
  topLeftRadius?: VariableAlias;
  /** @see VariableAlias */
  topRightRadius?: VariableAlias;
  /** @see VariableAlias */
  bottomLeftRadius?: VariableAlias;
  /** @see VariableAlias */
  bottomRightRadius?: VariableAlias;
  /** @see VariableAlias */
  minWidth?: VariableAlias;
  /** @see VariableAlias */
  maxWidth?: VariableAlias;
  /** @see VariableAlias */
  minHeight?: VariableAlias;
  /** @see VariableAlias */
  maxHeight?: VariableAlias;
  /** @see VariableAlias */
  counterAxisSpacing?: VariableAlias;
  /** @see VariableAlias */
  opacity?: VariableAlias;
  /** List of VariableAliass */
  fontFamily?: VariableAlias[];
  /** List of VariableAliass */
  fontSize?: VariableAlias[];
  /** List of VariableAliass */
  fontStyle?: VariableAlias[];
  /** List of VariableAliass */
  fontWeight?: VariableAlias[];
  /** List of VariableAliass */
  letterSpacing?: VariableAlias[];
  /** List of VariableAliass */
  lineHeight?: VariableAlias[];
  /** List of VariableAliass */
  paragraphSpacing?: VariableAlias[];
  /** List of VariableAliass */
  paragraphIndent?: VariableAlias[];
  /** List of VariableAliass */
  fills?: VariableAlias[];
  /** List of VariableAliass */
  strokes?: VariableAlias[];
  /** @see { [key: string]: VariableAlias; } */
  componentProperties?: { [key: string]: VariableAlias; };
  /** List of VariableAliass */
  textRangeFills?: VariableAlias[];
  /** List of VariableAliass */
  effects?: VariableAlias[];
  /** List of VariableAliass */
  layoutGrids?: VariableAlias[];
  /** @see IsLayerTraitBoundVariablesRectangleCornerRadii */
  rectangleCornerRadii?: IsLayerTraitBoundVariablesRectangleCornerRadii;
}


