import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  TrainingStepPres,
} from './training-step-pres';

describe('TrainingStepPres', () => {
  let component: TrainingStepPres;
  let fixture: ComponentFixture<TrainingStepPres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStepPres],
      providers: [provideMarkdown()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingStepPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
