import {
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';

/**
 * Directive to set the sandbox attribute on an iframe element.
 * Uses Renderer2 to set the attribute once at initialization, respecting the security intent (no runtime changes).
 * @example
 * ```html
 * <iframe [mfeSandbox]="'allow-scripts allow-same-origin'" />
 * ```
 */
@Directive({
  selector: 'iframe[mfeSandbox]'
})
export class SandboxDirective implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * The sandbox permissions to apply to the iframe.
   * Defaults to empty string (most restrictive: all restrictions apply).
   * Set once at initialization; runtime changes are ignored for security reasons.
   */
  public readonly mfeSandbox = input('');

  public ngOnInit(): void {
    this.renderer.setAttribute(this.elementRef.nativeElement, 'sandbox', this.mfeSandbox());
  }
}
