import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  DynamicContentPres,
} from './dynamic-content-pres';

describe('DynamicContentPres', () => {
  let component: DynamicContentPres;
  let fixture: ComponentFixture<DynamicContentPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DynamicContentPres],
      providers: [
        provideDynamicContent()
      ]
    });
    fixture = TestBed.createComponent(DynamicContentPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
