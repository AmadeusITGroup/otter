import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignTokenPresComponent } from './design-token-pres.component';

describe('DesignTokenPresComponent', () => {
  let component: DesignTokenPresComponent;
  let fixture: ComponentFixture<DesignTokenPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignTokenPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DesignTokenPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
