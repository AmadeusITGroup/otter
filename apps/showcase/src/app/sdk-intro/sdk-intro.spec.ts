import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  SdkIntro,
} from './sdk-intro';

describe('Sdk', () => {
  let component: SdkIntro;
  let fixture: ComponentFixture<SdkIntro>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SdkIntro]
    });
    fixture = TestBed.createComponent(SdkIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
