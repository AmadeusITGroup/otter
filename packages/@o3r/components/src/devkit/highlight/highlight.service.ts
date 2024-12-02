import {
  DOCUMENT,
} from '@angular/common';
import {
  DestroyRef,
  inject,
} from '@angular/core';
import {
  DEFAULT_ELEMENT_MIN_HEIGHT,
  DEFAULT_ELEMENT_MIN_WIDTH,
  DEFAULT_MAX_DEPTH,
  DEFAULT_THROTTLE_INTERVAL,
  HIGHLIGHT_WRAPPER_CLASS,
} from './constants';
import {
  computeNumberOfAncestors,
  createChip,
  createOverlay,
  getIdentifier,
  runRefreshIfNeeded,
  throttle,
} from './helpers';
import type {
  ElementWithGroupInfo,
  ElementWithGroupInfoAndDepth,
  GroupInfo,
} from './models';

export class HighlightService {
  /**
   * Group information
   * Value could be changed through chrome extension options
   */
  public groupsInfo: Record<string, GroupInfo> = {};

  /**
   * Maximum number of components ancestor
   * Value could be changed through chrome extension view
   */
  public maxDepth = DEFAULT_MAX_DEPTH;

  /**
   * Element min height to be considered
   * Value could be changed through chrome extension options
   */
  public elementMinHeight = DEFAULT_ELEMENT_MIN_HEIGHT;

  /**
   * Element min width to be considered
   * Value could be changed through chrome extension options
   */
  public elementMinWidth = DEFAULT_ELEMENT_MIN_WIDTH;

  /**
   * Throttle interval to refresh the highlight elements
   * Value could be changed through chrome extension options
   */
  public throttleInterval = DEFAULT_THROTTLE_INTERVAL;

  private throttleRun: (() => void) | undefined;

  private readonly document = inject(DOCUMENT);

  private readonly mutationObserver = new MutationObserver((mutations) =>
    runRefreshIfNeeded(
      mutations,
      this.getHighlightWrapper(),
      () => this.throttleRun?.()
    )
  );

  private readonly resizeObserver = new ResizeObserver(() => this.throttleRun?.());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  private getHighlightWrapper() {
    return this.document.body.querySelector(`.${HIGHLIGHT_WRAPPER_CLASS}`);
  }

  private cleanHighlightWrapper() {
    this.getHighlightWrapper()?.querySelectorAll('*').forEach((node) => node.remove());
  }

  private initializeHighlightWrapper() {
    let wrapper = this.getHighlightWrapper();
    if (!wrapper) {
      wrapper = this.document.createElement('div');
      wrapper.classList.add(HIGHLIGHT_WRAPPER_CLASS);
      this.document.body.append(wrapper);
    }
    this.cleanHighlightWrapper();
  }

  private run() {
    this.initializeHighlightWrapper();
    const wrapper = this.getHighlightWrapper()!;

    // We have to select all elements from document because
    // with CSSSelector it's impossible to select element
    // by regex on their `tagName`, attribute name or attribute value.
    const elementsWithInfo = Array.from(this.document.body.querySelectorAll<HTMLElement>('*'))
      .reduce((acc: ElementWithGroupInfo[], element) => {
        const { height, width } = element.getBoundingClientRect();
        if (height < this.elementMinHeight || width < this.elementMinWidth) {
          return acc;
        }
        const elementInfo = Object.values(this.groupsInfo).find((info) => {
          const regexp = new RegExp(info.regexp, 'i');

          return regexp.test(element.tagName)
            || Array.from(element.attributes).some((attr) => regexp.test(attr.name))
            || Array.from(element.classList).some((cName) => regexp.test(cName));
        });
        if (elementInfo) {
          return acc.concat({ ...elementInfo, htmlElement: element });
        }
        return acc;
      }, []);
    const elementsWithInfoAndDepth = elementsWithInfo
      .reduce((acc: ElementWithGroupInfoAndDepth[], elementWithInfo, _, array) => {
        const depth = computeNumberOfAncestors(elementWithInfo.htmlElement, array.map((e) => e.htmlElement));
        if (depth <= this.maxDepth) {
          return acc.concat({
            ...elementWithInfo,
            depth
          });
        }
        return acc;
      }, []);

    const overlayData: Record<string, { chip: HTMLElement; overlay: HTMLElement; depth: number }[]> = {};
    elementsWithInfoAndDepth.forEach((item) => {
      const { htmlElement: element, backgroundColor, color, displayName, depth } = item;
      const rect = element.getBoundingClientRect();
      const position = element.computedStyleMap().get('position')?.toString() === 'fixed' ? 'fixed' : 'absolute';
      const top = `${position === 'fixed' ? rect.top : (rect.top + window.scrollY)}px`;
      const left = `${position === 'fixed' ? rect.left : (rect.left + window.scrollX)}px`;
      const overlay = createOverlay(this.document, {
        top, left, width: `${rect.width}px`, height: `${rect.height}px`, position, backgroundColor
      });
      wrapper.append(overlay);
      const chip = createChip(this.document, {
        displayName,
        depth,
        top,
        left,
        backgroundColor,
        color,
        position,
        name: getIdentifier(item)
      });
      wrapper.append(chip);
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
            // In case of overlap,
            // we should translate the chip to have it visible
            // and reduce the size of the overlay.
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

  /**
   * Returns true if the highlight is displayed
   */
  public isRunning() {
    return !!this.throttleRun;
  }

  /**
   * Start the highlight of elements
   */
  public start() {
    this.stop();
    this.throttleRun = throttle(() => this.run(), this.throttleInterval);
    this.throttleRun();
    this.document.body.addEventListener('scroll', this.throttleRun, true);
    this.resizeObserver.observe(this.document.body);
    this.mutationObserver.observe(this.document.body, { childList: true, subtree: true });
  }

  /**
   * Stop the highlight of elements
   */
  public stop() {
    this.cleanHighlightWrapper();
    if (this.throttleRun) {
      this.document.body.removeEventListener('scroll', this.throttleRun, true);
      this.resizeObserver.disconnect();
      this.mutationObserver.disconnect();
      this.throttleRun = undefined;
    }
  }
}
