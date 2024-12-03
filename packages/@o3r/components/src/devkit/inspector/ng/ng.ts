export interface Ng {
  /**
   * Retrieves the component instance associated with a given DOM element.
   *
   * Usage:
   *
   * Given the following DOM structure:
   * ```html
   * <my-app>
   *   <div>
   *     <child-comp></child-comp>
   *   </div>
   * </my-app>
   * ```
   * Calling `getComponent` on `<child-comp>` will return the instance of `ChildComponent`
   * associated with this DOM element.
   *
   * Calling the function on `<my-app>` will return the `MyApp` instance.
   * @param element DOM element from which the component should be retrieved.
   * @returns Component instance associated with the element or `null` if there
   *    is no component associated with it.
   */
  getComponent<T = any>(element: Element): T | null;

  /**
   * Retrieves the component instance whose view contains the DOM element.
   *
   * For example, if `<child-comp>` is used in the template of `<app-comp>`
   * (i.e. a `ViewChild` of `<app-comp>`), calling `getOwningComponent` on `<child-comp>`
   * would return `<app-comp>`.
   * @param elementOrDir DOM element, component or directive instance
   *    for which to retrieve the root components.
   * @returns Component instance whose view owns the DOM element or null if the element is not
   *    part of a component view.
   */
  getOwningComponent<T = any>(elementOrDir: Element | object): T | null;

  /**
   * Retrieves the host element of a component or directive instance.
   * The host element is the DOM element that matched the selector of the directive.
   * @param componentOrDirective Component or directive instance for which the host
   *     element should be retrieved.
   * @returns Host element of the target.
   */
  getHostElement(componentOrDirective: object): Element;
}
