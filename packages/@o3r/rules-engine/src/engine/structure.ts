export type NativeTypes = string | boolean | number;
/** Generic operand */
export interface Operand<T extends string, U extends NativeTypes = NativeTypes> {
  /** Operand type */
  type: T;
  /** Static value */
  value: U;
}

/** Operand based on fact */
export interface OperandFact extends Operand<'FACT', string> {
  /** JSONPath to deep read the fact value */
  path?: string;
}

/** Condition available operand types */
export type GenericOperand = OperandFact | Operand<'RUNTIME_FACT', string> | Operand<'LITERAL'>;

/** Condition object interface with unary operator */
export interface UnaryOperation {
  /** Left Hand Side */
  lhs: GenericOperand;
  /** Operator */
  operator: string;
}

/** Condition object interface */
export interface BinaryOperation {
  /** Left Hand Side */
  lhs: GenericOperand;
  /** Right Hand Side */
  rhs: GenericOperand;
  /** Operator */
  operator: string;
}

/** Nested Condition */
// eslint-disable-next-line no-use-before-define
export type NestedCondition = UnaryOperation | BinaryOperation | TopLevelCondition;
/** All Condition */
// eslint-disable-next-line id-blacklist
export type AllConditions = {all: NestedCondition[]; any?: never; not?: never};
/** Any Condition */
// eslint-disable-next-line id-blacklist
export type AnyConditions = {any: NestedCondition[]; all?: never; not?: never};
/** Not Condition */
// eslint-disable-next-line id-blacklist
export type NotCondition = {not: NestedCondition; all?: never; any?: never};
/** Top level Condition in the rule definition */
export type TopLevelCondition = AllConditions | AnyConditions | NotCondition | UnaryOperation | BinaryOperation;

/** Event emitted in case the rule condition is passed */
export interface RuleEvent {
  /** Type (or name) of the event */
  type: string;
  /** list of parameter associated to the event */
  params?: Record<string, any>;
}

/** Base for the Rule definition */
export interface Rule {
  /** Unique id associated to a rule*/
  id: string;
  /** Runtime facts that are needed for the rule execution (sent by the CMS) */
  inputRuntimeFacts: string[];
  /** Facts that are needed for the rule execution (sent by the CMS) */
  inputFacts: string[];
  /** Runtime facts that are created/updated by the rule*/
  outputRuntimeFacts: string[];
  /** Name of the rule*/
  name: string;
  /** rootElement of the rule, that contains either a block, either an action list*/
  // eslint-disable-next-line no-use-before-define
  rootElement: AllBlock;
}

/** List of possible types of actions resulted as output of a rule execution */
export type ActionTypes = 'SET_FACT' | 'UPDATE_CONFIG' | 'UPDATE_ASSET' | 'UPDATE_LOCALISATION' | 'UPDATE_PLACEHOLDER';

/** Types associated to the condition blocks that are supported */
export type ConditionBlockTypes = 'IF_ELSE';

/** Interface common to all elements */
export interface RuleElement {
  /** Type of the element*/
  elementType: string;
}

/** Interface common to all actions */
export interface ActionBlock extends RuleElement {
  elementType: 'ACTION';
  actionType: ActionTypes;
  value: any;
}

/** Interface of action that sets or updates a temporary fact */
export interface ActionSetTemporaryFactBlock extends ActionBlock {
  actionType: 'SET_FACT';
  fact: string;
}

/** Interface of block Rule */
export interface RuleBlock extends RuleElement {
  elementType: 'RULE_BLOCK';
  blockType: ConditionBlockTypes;
}

/** All supported blocks (supporting nested structure) */
export type AllBlock =
// eslint-disable-next-line no-use-before-define
  IfElseBlock
  | (ActionBlock & Record<string, any>);

/** Block representing an 'if else' condition. If no condition specified it will execute success elements only */
export interface IfElseBlock extends RuleBlock {
  blockType: 'IF_ELSE';
  successElements: AllBlock[];
  failureElements: AllBlock[];
  condition?: TopLevelCondition;
}

/** Interface of a ruleset as it's specified in the json file */
export interface Ruleset {
  /** Unique id of the ruleset*/
  id: string;
  /** Name of the ruleset */
  name: string;
  /** Optional ruleset description */
  description?: string;
  /** List of rules associated to the ruleset */
  rules: Rule[];
  /** Optional date range where the ruleset will be executed*/
  validityRange?: {from?: string; to?: string};
  /** Component linked to the ruleset, if set it will disable the ruleset execution per default, waiting to a subscription */
  linkedComponent?: {library: string; name: string};
}
