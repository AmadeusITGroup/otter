import { Rule } from '@angular-devkit/schematics';

/** Rule Factory prototype */
export type RuleFactory = (options: {[k: string]: unknown}, rootPath: string) => Rule;
