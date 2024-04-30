import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { O3rComponent } from '@o3r/core';
import {
  CopyTextPresComponent,
  ElfPresComponent,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-sdk',
  standalone: true,
  imports: [
    CopyTextPresComponent,
    RouterLink,
    ElfPresComponent,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './elf.template.html',
  styleUrls: ['./elf.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElfComponent implements AfterViewInit {
  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  constructor(private readonly inPageNavPresService: InPageNavPresService) {}

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
