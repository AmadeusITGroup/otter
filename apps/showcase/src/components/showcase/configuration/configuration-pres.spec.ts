import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPresComponent } from './configuration-pres.component';

describe('ConfigurationPresComponent', () => {
  let component: ConfigurationPresComponent;
  let fixture: ComponentFixture<ConfigurationPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfigurationPresComponent]
    });
    fixture = TestBed.createComponent(ConfigurationPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
