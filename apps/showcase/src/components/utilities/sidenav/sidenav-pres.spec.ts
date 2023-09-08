import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavPresComponent } from './sidenav-pres.component';

describe('SidenavPresComponent', () => {
  let component: SidenavPresComponent;
  let fixture: ComponentFixture<SidenavPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidenavPresComponent]
    });
    fixture = TestBed.createComponent(SidenavPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
