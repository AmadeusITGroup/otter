import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  SdkTraining,
} from './sdk-training';

describe('SdkTraining', () => {
  let component: SdkTraining;
  let fixture: ComponentFixture<SdkTraining>;

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
      imports: [SdkTraining],
      providers: [
        provideDynamicContent()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTraining);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
