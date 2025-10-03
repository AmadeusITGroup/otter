import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  O3rElement,
} from '@o3r/testing/core';
import {
  SidenavPres,
} from './sidenav-pres';
import {
  SidenavPresFixtureComponent,
} from './sidenav-pres-fixture';

let componentFixture: SidenavPresFixtureComponent;

describe('SidenavPres', () => {
  let component: SidenavPres;
  let fixture: ComponentFixture<SidenavPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidenavPres]
    });
    fixture = TestBed.createComponent(SidenavPres);
    component = fixture.componentInstance;

    componentFixture = new SidenavPresFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
