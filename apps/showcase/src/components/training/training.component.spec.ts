import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  TrainingComponent,
} from './training.component';

describe('SdkTrainingComponent', () => {
  let component: TrainingComponent;
  let fixture: ComponentFixture<TrainingComponent>;
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
      imports: [TrainingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
