import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SdkIntroComponent } from './sdk-intro.component';

describe('SdkComponent', () => {
  let component: SdkIntroComponent;
  let fixture: ComponentFixture<SdkIntroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SdkIntroComponent]
    });
    fixture = TestBed.createComponent(SdkIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
