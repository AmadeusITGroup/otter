import {
  HIGHLIGHT_CHIP_CLASS,
  HIGHLIGHT_OVERLAY_CLASS,
  HIGHLIGHT_WRAPPER_CLASS,
} from './constants';
import type {
  ElementWithGroupInfo,
} from './models';

/**
 * Retrieve the identifier of the element
 * @param element
 */
export function getIdentifier(element: ElementWithGroupInfo): string {
  const { tagName, attributes, classList } = element.htmlElement;
  const regexp = new RegExp(element.regexp, 'i');
  if (!regexp.test(tagName)) {
    const attribute = Array.from(attributes).find((attr) => regexp.test(attr.name));
    if (attribute) {
      return `${attribute.name}${attribute.value ? `="${attribute.value}"` : ''}`;
    }
    const className = Array.from(classList).find((cName) => regexp.test(cName));
    if (className) {
      return className;
    }
  }
  return tagName;
}

/**
 * Compute the number of ancestors of a given element based on a list of elements
 * @param element
 * @param elementList
 */
export function computeNumberOfAncestors(element: HTMLElement, elementList: HTMLElement[]) {
  return elementList.filter((el: HTMLElement) => el.contains(element)).length;
}

/**
 * Throttle {@link fn} with a {@link delay}
 * @param fn method to run
 * @param delay given in ms
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timerFlag: ReturnType<typeof setTimeout> | null = null;

  const throttleFn = (...args: Parameters<T>) => {
    if (timerFlag === null) {
      fn(...args);
      timerFlag = setTimeout(() => {
        fn(...args);
        timerFlag = null;
      }, delay);
    }
  };
  return throttleFn;
}

/**
 * Run {@link refreshFn} if {@link mutations} implies to refresh elements inside {@link highlightWrapper}
 * @param mutations
 * @param highlightWrapper
 * @param refreshFn
 */
export function runRefreshIfNeeded(mutations: MutationRecord[], highlightWrapper: Element | null, refreshFn: () => void) {
  if (
    mutations.some((mutation) =>
      mutation.target !== highlightWrapper
      || (
        mutation.target === document.body
        && Array.from<HTMLElement>(mutation.addedNodes.values() as any)
          .concat(...mutation.removedNodes.values() as any)
          .some((node) => !node.classList.contains(HIGHLIGHT_WRAPPER_CLASS))
      )
    )
  ) {
    refreshFn();
  }
}

/**
 * Options to create an overlay element
 */
export interface CreateOverlayOptions {
  top: string;
  left: string;
  position: string;
  width: string;
  height: string;
  backgroundColor: string;
}

/**
 * Create an overlay element
 * @param doc HTML Document
 * @param opts
 */
export function createOverlay(doc: Document, opts: CreateOverlayOptions) {
  const overlay = doc.createElement('div');
  overlay.classList.add(HIGHLIGHT_OVERLAY_CLASS);
  // All static style could be moved in a <style>
  overlay.style.top = opts.top;
  overlay.style.left = opts.left;
  overlay.style.width = opts.width;
  overlay.style.height = opts.height;
  overlay.style.border = `1px solid ${opts.backgroundColor}`;
  overlay.style.zIndex = '10000';
  overlay.style.position = opts.position;
  overlay.style.pointerEvents = 'none';
  return overlay;
}

/**
 * Options to create a chip element
 */
export interface CreateChipOptions {
  displayName: string;
  depth: number;
  top: string;
  left: string;
  position: string;
  backgroundColor: string;
  color?: string;
  name: string;
}

/**
 * Create a chip element
 * @param doc HTML Document
 * @param opts
 */
export function createChip(doc: Document, opts: CreateChipOptions) {
  const chip = doc.createElement('div');
  chip.classList.add(HIGHLIGHT_CHIP_CLASS);
  chip.textContent = `${opts.displayName} ${opts.depth}`;
  // All static style could be moved in a <style>
  chip.style.top = opts.top;
  chip.style.left = opts.left;
  chip.style.backgroundColor = opts.backgroundColor;
  chip.style.color = opts.color ?? '#FFF';
  chip.style.position = opts.position;
  chip.style.display = 'inline-block';
  chip.style.padding = '2px 4px';
  chip.style.borderRadius = '0 0 4px';
  chip.style.cursor = 'pointer';
  chip.style.zIndex = '10000';
  chip.style.textWrap = 'no-wrap';
  chip.title = opts.name;
  chip.addEventListener('click', () => {
    // Should we log in the console as well ?
    void navigator.clipboard.writeText(opts.name);
  });
  return chip;
}
