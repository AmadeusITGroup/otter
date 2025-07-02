export interface JSONDefinition {
  type: string;
  format?: string;
  label?: string;
  description?: string;
  default?: any;
  items?: JSONDefinition;
  $ref?: string;
  values?: string[];
  properties?: { [name: string]: JSONDefinition };
}
