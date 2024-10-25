import type {
  BootstrapConfig,
  Dataset
} from '../../core/application/dgp.interfaces';

/**
 * Pad number
 * @param val
 * @param digits
 */
export function padNumber(val: number, digits = 2): string {
  const str = `${val}`;
  return '0'.repeat(Math.max(0, digits - str.length)) + str;
}

/**
 * Returns TRUE if bootstrap config environment is production FALSE otherwise
 * @param dataset
 * @returns TRUE if bootstrap config environment is production FALSE otherwise
 */
export function isProductionEnvironment(dataset: Dataset): boolean {
  const bootstrapConfig: BootstrapConfig = dataset.bootstrapconfig && JSON.parse(dataset.bootstrapconfig);
  return bootstrapConfig?.environment === 'prod';
}
