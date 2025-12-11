import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import {
  RouterModule,
} from '@angular/router';
import {
  O3rComponent,
} from '@o3r/core';

/** Link information */
export interface SideNavLink {
  /** Url of the link */
  url: string;
  /** Label to display */
  label: string;
}

/** Group of links */
export interface SideNavLinksGroup {
  /** Label of the group */
  label: string;
  /** List of links */
  links: SideNavLink[];
}

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-sidenav-pres',
  imports: [RouterModule],
  templateUrl: './sidenav-pres.html',
  styleUrls: ['./sidenav-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavPres {
  /**
   * List of links' groups
   */
  @Input()
  public linksGroups: SideNavLinksGroup[] = [];

  /** Active url */
  @Input()
  public activeUrl?: string;
}
