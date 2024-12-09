import {
  Injectable,
  OnDestroy,
} from '@angular/core';

const HIGHLIGHT_WRAPPER_CLASS = 'highlight-wrapper';
const HIGHLIGHT_OVERLAY_CLASS = 'highlight-overlay';
const HIGHLIGHT_CHIP_CLASS = 'highlight-chip';
// Should we set it customizable (if yes, chrome extension view or options)
const ELEMENT_MIN_HEIGHT = 30;
// Should we set it customizable (if yes, chrome extension view or options)
const ELEMENT_MIN_WIDTH = 60;
// Should we set it customizable (if yes, chrome extension view or options)
const THROTTLE_INTERVAL = 500;

interface ElementInfo {
  color?: string;
  backgroundColor: string;
  displayName: string;
  regexp: string;
}

interface ElementWithSelectorInfo {
  element: HTMLElement;
  info: ElementInfo;
}

interface ElementWithSelectorInfoAndDepth extends ElementWithSelectorInfo {
  depth: number;
}

function getIdentifier(element: HTMLElement, info: ElementInfo): string {
  const tagName = element.tagName.toLowerCase();
  const regexp = new RegExp(info.regexp, 'i');
  if (!regexp.test(element.tagName)) {
    const attribute = Array.from(element.attributes).find((att) => regexp.test(att.name));
    if (attribute) {
      return `${attribute.name}${attribute.value ? `="${attribute.value}"` : ''}`;
    }
    const className = Array.from(element.classList).find((cName) => regexp.test(cName));
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
function computeNumberOfAncestors(element: HTMLElement, elementList: HTMLElement[]) {
  return elementList.filter((el: HTMLElement) => el.contains(element)).length;
}

function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
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

@Injectable({
  providedIn: 'root'
})
export class HighlightService implements OnDestroy {
  // Should be customizable from the chrome extension view
  public maxDepth = 10;

  // Should be customizable from the chrome extension options
  public elementsInfo: Record<string, ElementInfo> = {
    otter: {
      backgroundColor: '#f4dac6',
      color: 'black',
      regexp: '^o3r',
      displayName: 'o3r'
    },
    designFactory: {
      backgroundColor: '#000835',
      regexp: '^df',
      displayName: 'df'
    },
    ngBootstrap: {
      backgroundColor: '#0d6efd',
      regexp: '^ngb',
      displayName: 'ngb'
    }
  };

  private readonly throttleRun = throttle(this.run.bind(this), THROTTLE_INTERVAL);

  // private interval: ReturnType<typeof setInterval> | null = null;

  private readonly mutationObserver = new MutationObserver((mutations) => {
    const wrapper = document.querySelector(`.${HIGHLIGHT_WRAPPER_CLASS}`);
    if (mutations.some((mutation) =>
      mutation.target !== wrapper
      || (
        mutation.target === document.body
        && Array.from<HTMLElement>(mutation.addedNodes.values() as any)
          .concat(...mutation.removedNodes.values() as any)
          .some((node) => !node.classList.contains(HIGHLIGHT_WRAPPER_CLASS))
      )
    )) {
      this.throttleRun();
    }
  });

  private readonly resizeObserver = new ResizeObserver(this.throttleRun.bind(this));

  constructor() {
    this.start();
  }

  public start() {
    this.throttleRun();
    document.addEventListener('scroll', this.throttleRun, true);
    this.resizeObserver.observe(document.body);
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  public stop() {
    document.removeEventListener('scroll', this.throttleRun, true);
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
  }

  public run() {
    let wrapper = document.querySelector(`.${HIGHLIGHT_WRAPPER_CLASS}`);
    if (wrapper) {
      wrapper.querySelectorAll('*').forEach((node) => node.remove());
    } else {
      wrapper = document.createElement('div');
      wrapper.classList.add(HIGHLIGHT_WRAPPER_CLASS);
      document.body.append(wrapper);
    }

    // We have to select all elements from document because
    // with CSSSelector it's impossible to select element by regex on their `tagName`, attribute name or attribute value
    const elementsWithInfo = Array.from(document.querySelectorAll<HTMLElement>('*'))
      .reduce((acc: ElementWithSelectorInfo[], element) => {
        const rect = element.getBoundingClientRect();
        if (rect.height < ELEMENT_MIN_HEIGHT || rect.width < ELEMENT_MIN_WIDTH) {
          return acc;
        }
        const elementInfo = Object.values(this.elementsInfo).find((info) => {
          const regexp = new RegExp(`^${info.regexp}`, 'i');

          return regexp.test(element.tagName)
            || Array.from(element.attributes).some((attr) => regexp.test(attr.name))
            || Array.from(element.classList).some((cName) => regexp.test(cName));
        });
        if (elementInfo) {
          return acc.concat({ element, info: elementInfo });
        }
        return acc;
      }, [])
      .reduce((acc: ElementWithSelectorInfoAndDepth[], elementWithInfo, _, array) => {
        const depth = computeNumberOfAncestors(elementWithInfo.element, array.map((e) => e.element));
        if (depth <= this.maxDepth) {
          return acc.concat({
            ...elementWithInfo,
            depth
          });
        }
        return acc;
      }, []);

    const overlayData: Record<string, { chip: HTMLElement; overlay: HTMLElement; depth: number }[]> = {};
    elementsWithInfo.forEach(({ element, info, depth }) => {
      const { backgroundColor, color, displayName } = info;
      const rect = element.getBoundingClientRect();
      const overlay = document.createElement('div');
      const chip = document.createElement('div');
      const position = element.computedStyleMap().get('position')?.toString() === 'fixed' ? 'fixed' : 'absolute';
      const top = `${position === 'fixed' ? rect.top : (rect.top + window.scrollY)}px`;
      const left = `${position === 'fixed' ? rect.left : (rect.left + window.scrollX)}px`;
      overlay.classList.add(HIGHLIGHT_OVERLAY_CLASS);
      // All static style could be moved in a <style>
      overlay.style.top = top;
      overlay.style.left = left;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.border = `1px solid ${backgroundColor}`;
      overlay.style.zIndex = '10000';
      overlay.style.position = position;
      overlay.style.pointerEvents = 'none';
      wrapper.append(overlay);
      chip.classList.add(HIGHLIGHT_CHIP_CLASS);
      chip.textContent = `${displayName} ${depth}`;
      // All static style could be moved in a <style>
      chip.style.top = top;
      chip.style.left = left;
      chip.style.backgroundColor = backgroundColor;
      chip.style.color = color ?? '#FFF';
      chip.style.position = position;
      chip.style.display = 'inline-block';
      chip.style.padding = '2px 4px';
      chip.style.borderRadius = '0 0 4px';
      chip.style.cursor = 'pointer';
      chip.style.zIndex = '10000';
      chip.style.textWrap = 'no-wrap';
      const name = getIdentifier(element, info);
      chip.title = name;
      wrapper.append(chip);
      chip.addEventListener('click', () => {
        // Should we log in the console as well ?
        void navigator.clipboard.writeText(name);
      });
      const positionKey = `${top};${left}`;
      if (!overlayData[positionKey]) {
        overlayData[positionKey] = [];
      }
      overlayData[positionKey].push({ chip, overlay, depth });
    });
    Object.values(overlayData).forEach((chips) => {
      chips
        .sort(({ depth: depthA }, { depth: depthB }) => depthA - depthB)
        .forEach(({ chip, overlay }, index, array) => {
          if (index !== 0) {
            const translateX = array.slice(0, index).reduce((sum, e) => sum + e.chip.getBoundingClientRect().width, 0);
            chip.style.transform = `translateX(${translateX}px)`;
            overlay.style.margin = `${index}px 0 0 ${index}px`;
            overlay.style.width = `${+overlay.style.width.replace('px', '') - 2 * index}px`;
            overlay.style.height = `${+overlay.style.height.replace('px', '') - 2 * index}px`;
            overlay.style.zIndex = `${+overlay.style.zIndex - index}`;
          }
        });
    });
  }

  public ngOnDestroy() {
    this.stop();
  }
}
