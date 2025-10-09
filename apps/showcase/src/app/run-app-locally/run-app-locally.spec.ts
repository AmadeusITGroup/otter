import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  RunAppLocally,
} from './run-app-locally';

describe('RunAppLocally', () => {
  let component: RunAppLocally;
  let fixture: ComponentFixture<RunAppLocally>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RunAppLocally],
      providers: [provideMarkdown()]
    });
    fixture = TestBed.createComponent(RunAppLocally);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
