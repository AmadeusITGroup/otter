import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  Training,
} from './training';

describe('Training', () => {
  let component: Training;
  let fixture: ComponentFixture<Training>;
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
      imports: [Training],
      providers: [
        provideDynamicContent()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Training);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
