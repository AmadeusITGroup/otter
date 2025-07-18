import {
  HIGHLIGHT_CHIP_CLASS,
  HIGHLIGHT_OVERLAY_CLASS,
} from './constants';
import {
  computeNumberOfAncestors,
  createChip,
  CreateChipOptions,
  createOverlay,
  CreateOverlayOptions,
  filterElementsWithInfo,
  getIdentifier,
  throttle,
} from './helpers';
import {
  ElementWithGroupInfo,
  GroupInfo,
} from './models';

describe('Highlight helpers', () => {
  describe('getIdentifier', () => {
    it('should return the tagName', () => {
      const element = {
        htmlElement: {
          tagName: 'prefix-selector'
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-selector');
    });

    it('should return the first attributeName matching', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [
            { name: 'custom-attribute' },
            { name: 'prefix-attribute' },
            { name: 'prefix-attribute-2' }
          ] as any as NamedNodeMap
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-attribute');
    });

    it('should return the first attributeName matching with its value', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [{ name: 'prefix-attribute', value: 'value' }] as any as NamedNodeMap
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-attribute="value"');
    });

    it('should return the first className matching', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [] as any as NamedNodeMap,
          classList: ['custom-class', 'prefix-class', 'prefix-class-2'] as any as DOMTokenList
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-class');
    });
  });

  describe('computeNumberOfAncestors', () => {
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let siblingElement: HTMLElement;
    let grandparentElement: HTMLElement;

    beforeEach(() => {
      grandparentElement = document.createElement('div');
      parentElement = document.createElement('div');
      childElement = document.createElement('div');
      siblingElement = document.createElement('div');

      grandparentElement.append(parentElement);
      parentElement.append(childElement);
      grandparentElement.append(siblingElement);

      document.body.innerHTML = '';
      document.body.append(grandparentElement);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should return the correct number of ancestors for a child element', () => {
      const elementList = [grandparentElement, parentElement, siblingElement];
      const result = computeNumberOfAncestors(childElement, elementList);

      expect(result).toBe(2); // grandparentElement and parentElement are ancestors
    });

    it('should return 0 if the element has no ancestors in the list', () => {
      const elementList = [siblingElement];
      const result = computeNumberOfAncestors(childElement, elementList);

      expect(result).toBe(0); // siblingElement is not an ancestor
    });

    it('should return 1 if the element has one ancestor in the list', () => {
      const elementList = [parentElement];
      const result = computeNumberOfAncestors(childElement, elementList);

      expect(result).toBe(1); // parentElement is the only ancestor
    });

    it('should return 0 if the element list is empty', () => {
      const elementList: HTMLElement[] = [];
      const result = computeNumberOfAncestors(childElement, elementList);

      expect(result).toBe(0); // No ancestors in an empty list
    });

    it('should return 0 if the element is not contained in any ancestor', () => {
      const unrelatedElement = document.createElement('div');
      const elementList = [unrelatedElement];
      const result = computeNumberOfAncestors(childElement, elementList);

      expect(result).toBe(0); // unrelatedElement is not an ancestor
    });
  });

  describe('filterElementsWithInfo', () => {
    let grandparentElement: HTMLElement;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let siblingElement: HTMLElement;
    let elements: HTMLElement[];

    const elementMinHeight = 20;
    const elementMinWidth = 20;
    const groupsInfo: Record<string, GroupInfo> = {
      'Group 1': {
        regexp: '^div',
        backgroundColor: 'blue',
        displayName: 'Group 1'
      },
      'Group 2': {
        regexp: '^span',
        backgroundColor: 'red',
        displayName: 'Group 2'
      }
    };

    beforeEach(() => {
      // Create a mock DOM structure using createElement
      grandparentElement = document.createElement('div');
      parentElement = document.createElement('span');
      childElement = document.createElement('div');
      siblingElement = document.createElement('div');

      // Set spy to simulate dimensions
      jest.spyOn(grandparentElement, 'getBoundingClientRect').mockReturnValue({
        height: 200,
        width: 200
      } as DOMRect);
      jest.spyOn(parentElement, 'getBoundingClientRect').mockReturnValue({
        height: 100,
        width: 100
      } as DOMRect);
      jest.spyOn(childElement, 'getBoundingClientRect').mockReturnValue({
        height: 50,
        width: 50
      } as DOMRect);
      jest.spyOn(siblingElement, 'getBoundingClientRect').mockReturnValue({
        height: 10,
        width: 10
      } as DOMRect);

      grandparentElement.append(parentElement);
      parentElement.append(childElement);
      parentElement.append(siblingElement);

      elements = [grandparentElement, parentElement, childElement, siblingElement];
    });

    it('should filter the only element that does not match the criteria', () => {
      const result: ElementWithGroupInfo[] = filterElementsWithInfo(elements, elementMinHeight, elementMinWidth, groupsInfo);

      expect(result).toHaveLength(3); // No elements match the criteria
    });

    it('should return an empty array if the element list is empty', () => {
      const result: ElementWithGroupInfo[] = filterElementsWithInfo([], elementMinHeight, elementMinWidth, groupsInfo);

      expect(result).toHaveLength(0); // No elements in the list
    });

    it('should filter elements based on size and group info', () => {
      const result: ElementWithGroupInfo[] = filterElementsWithInfo(elements, elementMinHeight, elementMinWidth, groupsInfo);

      expect(result).toHaveLength(3); // Two elements match the criteria
      expect(result[0].displayName).toBe('Group 1'); // First element matches group1
      expect(result[1].displayName).toBe('Group 2'); // Second element matches group2
      expect(result[2].displayName).toBe('Group 1'); // Third element matches group1
    });

    it('should correctly match elements based on tag name, attributes, or class names', () => {
      // Add attributes and classes to test matching
      grandparentElement.classList.add('test-class');
      parentElement.dataset.test = 'test-attr';

      const result: ElementWithGroupInfo[] = filterElementsWithInfo(elements, elementMinHeight, elementMinWidth, groupsInfo);

      expect(result.some((el) => el.htmlElement.tagName.toLowerCase() === 'div')).toBe(true); // Matches tag name
      expect(result.some((el) => el.htmlElement.dataset.test === 'test-attr')).toBe(true); // Matches attribute
      expect(result.some((el) => el.htmlElement.classList.contains('test-class'))).toBe(true); // Matches class name
    });
  });

  describe('createOverlay', () => {
    let mockDocument: Document;

    beforeEach(() => {
      // Create a mock document
      mockDocument = document.implementation.createHTMLDocument('Test Document');
    });

    it('should create an overlay element with the correct class and styles', () => {
      const opts: CreateOverlayOptions = {
        top: '10px',
        left: '20px',
        width: '100px',
        height: '50px',
        backgroundColor: 'red',
        position: 'absolute'
      };

      const overlay = createOverlay(mockDocument, opts, 2);

      expect(overlay).toBeInstanceOf(HTMLDivElement);
      expect(overlay.classList.contains(HIGHLIGHT_OVERLAY_CLASS)).toBe(true);
      expect(overlay.style.top).toBe('10px');
      expect(overlay.style.left).toBe('20px');
      expect(overlay.style.width).toBe('100px');
      expect(overlay.style.height).toBe('50px');
      expect(overlay.style.border).toBe('2px solid red');
      expect(overlay.style.zIndex).toBe('10000');
      expect(overlay.style.position).toBe('absolute');
      expect(overlay.style.pointerEvents).toBe('none');
      expect(overlay.style.zIndex).toBe('10000');
    });

    it('should alternate border style between solid and dotted based on depth', () => {
      const opts: CreateOverlayOptions = {
        top: '0px',
        left: '0px',
        width: '50px',
        height: '50px',
        backgroundColor: 'green',
        position: 'absolute'
      };

      const overlayDepthEven = createOverlay(mockDocument, opts, 2);
      const overlayDepthOdd = createOverlay(mockDocument, opts, 3);

      expect(overlayDepthEven.style.border).toBe('2px solid green');
      expect(overlayDepthOdd.style.border).toBe('2px dotted green');
    });
  });

  describe('createChip', () => {
    let mockDocument: Document;
    let mockOverlay: HTMLDivElement;

    beforeEach(() => {
      // Create a mock document
      mockDocument = document.implementation.createHTMLDocument('Test Document');

      // Create a mock overlay element
      mockOverlay = mockDocument.createElement('div');
      mockOverlay.style.boxShadow = 'none';
    });

    it('should create a chip element with the correct class and text content', () => {
      const opts: CreateChipOptions = {
        top: '10px',
        left: '20px',
        backgroundColor: 'blue',
        position: 'absolute',
        displayName: 'Test Chip',
        depth: 3,
        name: 'Test Name'
      };

      const chip = createChip(mockDocument, opts, mockOverlay);

      expect(chip).toBeInstanceOf(HTMLDivElement);
      expect(chip.classList.contains(HIGHLIGHT_CHIP_CLASS)).toBe(true);
      expect(chip.textContent).toBe('Test Chip 3');
      expect(chip.title).toBe('Test Name');
    });

    it('should set the correct styles on the chip element', () => {
      const opts: CreateChipOptions = {
        top: '10px',
        left: '20px',
        backgroundColor: 'red',
        color: '#000',
        position: 'fixed',
        displayName: 'Styled Chip',
        depth: 1,
        name: 'Styled Name',
        opacity: 0.8
      };

      const chip = createChip(mockDocument, opts, mockOverlay);

      expect(chip.style.top).toBe('10px');
      expect(chip.style.left).toBe('20px');
      expect(chip.style.backgroundColor).toBe('red');
      expect(chip.style.color).toBe('rgb(0, 0, 0)');
      expect(chip.style.position).toBe('fixed');
      expect(chip.style.display).toBe('inline-block');
      expect(chip.style.padding).toBe('2px 4px');
      expect(chip.style.borderRadius).toBe('0 0 4px');
      expect(chip.style.cursor).toBe('pointer');
      expect(chip.style.zIndex).toBe('10000');
      expect(chip.style.textWrap).toBe('no-wrap');
      expect(chip.style.opacity).toBe('0.8');
    });

    it('should copy the chip name to the clipboard on click', () => {
      const opts: CreateChipOptions = {
        top: '10px',
        left: '20px',
        backgroundColor: 'green',
        position: 'absolute',
        displayName: 'Clickable Chip',
        depth: 2,
        name: 'Chip Name'
      };

      // Mock the clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });

      const chip = createChip(mockDocument, opts, mockOverlay);
      chip.click();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Chip Name');
    });

    it('should handle mouseover and mouseout events correctly', () => {
      const opts: CreateChipOptions = {
        top: '10px',
        left: '20px',
        backgroundColor: 'purple',
        position: 'absolute',
        displayName: 'Hoverable Chip',
        depth: 1,
        name: 'Hover Name',
        opacity: 0.5
      };

      const chip = createChip(mockDocument, opts, mockOverlay);

      // Simulate mouseover
      chip.dispatchEvent(new Event('mouseover'));
      expect(chip.style.opacity).toBe('1');
      expect(mockOverlay.style.boxShadow).toBe('0 0 10px 3px purple');

      // Simulate mouseout
      chip.dispatchEvent(new Event('mouseout'));
      expect(chip.style.opacity).toBe('0.5');
      expect(mockOverlay.style.boxShadow).toBe('none');
    });

    describe('throttle', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should call the function immediately on first call', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);
        throttled('arg1', 'arg2');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      });

      it('should not call the function again before the delay', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);
        throttled();
        throttled();
        throttled();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      it('should call the function again after the delay', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);
        throttled();
        jest.advanceTimersByTime(100);
        throttled();
        expect(fn).toHaveBeenCalledTimes(2);
      });

      it('should pass all arguments to the throttled function', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 50);
        throttled(1, 2, 3);
        expect(fn).toHaveBeenCalledWith(1, 2, 3);
      });

      it('should not call the function if called multiple times within the delay', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 200);
        throttled();
        jest.advanceTimersByTime(100);
        throttled();
        throttled();
        expect(fn).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(100);
        throttled();
        expect(fn).toHaveBeenCalledTimes(2);
      });
    });
  });
});
