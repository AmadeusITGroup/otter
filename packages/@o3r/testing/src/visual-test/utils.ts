/**
 * Prepare css rule to hide specific blocks
 *
 * Should be called only once during the visual test.
 * @note: this function is evaluated in the context of the page and should not use external variables
 * @param ignoreClass
 */
export function prepareVisualTesting(ignoreClass = 'e2e-ignore') {
  const visualTestingCss = document.createElement('style');
  const visualTestingClass = 'visual-testing-render';
  visualTestingCss.textContent = `
    .${visualTestingClass} .${ignoreClass} {position: relative;}

    .${visualTestingClass} .${ignoreClass}:before {
      z-index: 999;
      content: '';
      width: 100%;
      height: 100%;
      background: grey;
      position: absolute;
      left: 0;
      top: 0;
  }`;

  document.head.append(visualTestingCss);
}

/**
 * Determine if the visual testing is enabled
 */
export function isVisualTestingEnabled() {
  const visualTestingClass = 'visual-testing-render';
  return document.body.classList.contains(visualTestingClass);
}

/**
 * Toggle the visual testing view : if it is active, will hide tagged components as grey blocks.
 * @note: this function is evaluated in the context of the page and cannot use external code
 * @param enabled
 */
export function toggleVisualTestingRender(enabled: boolean) {
  const visualTestingClass = 'visual-testing-render';
  if (enabled) {
    document.body.classList.add(visualTestingClass);
  } else {
    document.body.classList.remove(visualTestingClass);
  }
}
