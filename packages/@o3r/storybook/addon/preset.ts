/**
 * Storybook preset function for addOn registration
 *
 * @param entry
 */
export function managerEntries(entry: string[] = []) {
  return [...entry, require.resolve('./addon/register')];
}
