import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DynamicContentPresComponent,
} from './dynamic-content-pres.component';

describe('DynamicContentPresComponent', () => {
  let component: DynamicContentPresComponent;
  let fixture: ComponentFixture<DynamicContentPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DynamicContentPresComponent]
    });
    fixture = TestBed.createComponent(DynamicContentPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
