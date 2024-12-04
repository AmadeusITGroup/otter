import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  SdkTrainingComponent,
} from './sdk-training.component';

describe('SdkTrainingComponent', () => {
  let component: SdkTrainingComponent;
  let fixture: ComponentFixture<SdkTrainingComponent>;

  beforeEach(async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      headers: {},
      redirected: false,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('')
    } as Response));
    await TestBed.configureTestingModule({
      imports: [SdkTrainingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
