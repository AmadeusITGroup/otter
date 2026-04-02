import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import {
  DomSanitizer,
} from '@angular/platform-browser';
import type {
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  ConnectDirective,
} from '../connect/connect-directive';
import {
  HostInfoPipe,
} from '../host-info/host-info-pipe';
import {
  ScalableDirective,
} from '../resize/scalable-directive';
import {
  ApplyTheme,
} from '../theme/apply-theme-pipe';
import {
  SandboxDirective,
} from './sandbox.directive';

/**
 * Presentational component for rendering an iframe with MFE integration directives.
 * Applies host info injection, theming and cross-iframe communication.
 */
@Component({
  selector: 'mfe-iframe-embed',
  imports: [
    ConnectDirective,
    ScalableDirective,
    ApplyTheme,
    HostInfoPipe,
    SandboxDirective
  ],
  templateUrl: './iframe-embed.template.html',
  styleUrl: './iframe-embed.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeEmbedComponent {
  private readonly domSanitizer = inject(DomSanitizer);

  /** The URL for the iframe source (plain string or pre-sanitized SafeResourceUrl). */
  public readonly src = input.required<string | SafeResourceUrl>();

  /** The sanitized URL, auto-sanitized if a plain string is provided. */
  public readonly safeSrc = computed(() => {
    const value = this.src();
    return typeof value === 'string'
      ? this.domSanitizer.bypassSecurityTrustResourceUrl(value)
      : value;
  });

  /** The unique identifier for the module, used for cross-iframe communication. */
  public readonly moduleId = input.required<string>();

  /** The host application identifier sent to the embedded module. */
  public readonly hostApplicationId = input.required<string>();

  /**
   * The sandbox attribute for the iframe.
   * Pass through to the SandboxDirective on the iframe element.
   */
  public readonly sandbox = input('allow-scripts allow-same-origin');
}
