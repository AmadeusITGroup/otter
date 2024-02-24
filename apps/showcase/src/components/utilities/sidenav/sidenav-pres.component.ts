import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { O3rComponent } from '@o3r/core';
import { RouterModule } from '@angular/router';

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
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidenav-pres.template.html',
  styleUrls: ['./sidenav-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavPresComponent {
  /**
   * List of links' groups
   */
  @Input()
  public linksGroups: SideNavLinksGroup[] = [];

  /** Active url */
  @Input()
  public activeUrl?: string;
}
