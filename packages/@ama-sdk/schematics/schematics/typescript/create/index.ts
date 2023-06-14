import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { NgGenerateTypescriptSDKCoreSchematicsSchema } from '../core/schema';
import { NgGenerateTypescriptSDKShellSchematicsSchema } from '../shell/schema';
import { NgGenerateTypescriptSDKCreateSchematicsSchema } from './schema';

/**
 * Generate a typescript SDK repository and source code base on swagger specification
 *
 * @param options
 */
export function ngGenerateTypescriptSDK(options: NgGenerateTypescriptSDKCreateSchematicsSchema): Rule {
  return chain([
    schematic<NgGenerateTypescriptSDKShellSchematicsSchema>('typescript-shell', options),
    schematic<NgGenerateTypescriptSDKCoreSchematicsSchema>('typescript-core', options)
  ]);
}
