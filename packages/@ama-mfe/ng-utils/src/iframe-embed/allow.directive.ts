import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';

/**
 * Directive to set the allow attribute (Permissions Policy) on an iframe element.
 * Uses Renderer2 to set the attribute once at initialization, respecting the security intent (no runtime changes).
 * @example
 * ```html
 * <iframe [mfeAllow]="'camera; microphone; fullscreen'" />
 * ```
 */
@Directive({
  selector: 'iframe[mfeAllow]'
})
export class AllowDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * The Permissions Policy features to delegate to the iframe (e.g. `'camera; microphone'`).
   * Defaults to empty string (no additional feature delegated, the attribute is not set).
   * Set once at initialization; runtime changes are ignored for security reasons.
   */
  public readonly mfeAllow = input('');

  public ngOnInit(): void {
    const allow = this.mfeAllow();
    if (allow) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'allow', allow);
    }
  }
}
