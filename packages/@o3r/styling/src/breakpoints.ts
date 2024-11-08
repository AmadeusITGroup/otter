import {
  Breakpoints,
} from '@angular/cdk/layout';

/**
 * Angular CDK Breakpoints to detect devices
 * @deprecated use Breakpoints exported by @angular/cdk instead, will be removed in v12
 */
export const deviceBreakpoints = {
  mobile: [Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait],
  tablet: [Breakpoints.TabletLandscape, Breakpoints.TabletPortrait]
};
