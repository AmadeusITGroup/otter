import { ComponentFixture, TestBed } from '@angular/core/testing';
import { O3rElement } from '@o3r/testing/core';
import { SidenavPresComponent } from './sidenav-pres.component';
import { SidenavPresFixtureComponent } from './sidenav-pres.fixture';

let componentFixture: SidenavPresFixtureComponent;

describe('SidenavPresComponent', () => {
  let component: SidenavPresComponent;
  let fixture: ComponentFixture<SidenavPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidenavPresComponent]
    });
    fixture = TestBed.createComponent(SidenavPresComponent);
    component = fixture.componentInstance;

    componentFixture = new SidenavPresFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
