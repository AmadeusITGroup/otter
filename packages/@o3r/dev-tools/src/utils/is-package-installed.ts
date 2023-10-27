/**
 * Check if an npm package is installed
 *
 * @param packageName The package to check
 * @deprecated will be removed in Otter v12.
 */
export function isPackageInstalled(packageName: string) {
  try {
    return !!require(packageName);
  } catch (error: any) {
    return !(error?.code === 'MODULE_NOT_FOUND');
  }
}
