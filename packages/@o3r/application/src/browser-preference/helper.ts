/**
 * Method that returns the setting of the user regarding animations.
 * This setting is generally set in the Operating System settings, and it is used by browsers.
 * Refer to: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 */
export function prefersReducedMotion(): boolean {
  const mediaQueryList = window.matchMedia('(prefers-reduced-motion)');

  return mediaQueryList.matches;
}
