import { Breakpoints } from '@angular/cdk/layout';

/**
 * Angular CDK Breakpoints to detect devices
 */
export const deviceBreakpoints = {
  mobile: [Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait],
  tablet: [Breakpoints.TabletLandscape, Breakpoints.TabletPortrait]
};
