import {
  Rule,
  schematic,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  NgGenerateStoreSchematicsSchema,
} from './schema';

/**
 * Create an Otter store
 * @param options
 */
function ngGenerateStoreFn(options: NgGenerateStoreSchematicsSchema): Rule {
  const parameterToChildSchematics: Partial<NgGenerateStoreSchematicsSchema> = Object.entries(options)
    .reduce<Record<string, any>>((acc, [key, value]) => {
      acc[key] = value === null ? undefined : value;
      return acc;
    }, {});
  switch (options.storeType) {
    case 'simple-sync': {
      return schematic('store-simple-sync', parameterToChildSchematics);
    }
    case 'simple-async': {
      return schematic('store-simple-async', parameterToChildSchematics);
    }
    case 'entity-async': {
      return schematic('store-entity-async', parameterToChildSchematics);
    }
    case 'entity-sync': {
      return schematic('store-entity-sync', parameterToChildSchematics);
    }
    default: {
      return schematic('store-entity-async', parameterToChildSchematics);
    }
  }
}

/**
 * Create an Otter store
 * @param options
 */
export const ngGenerateStore = createOtterSchematic(ngGenerateStoreFn);
