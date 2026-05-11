import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  FormsParent,
} from './forms-parent';

describe('FormsParent', () => {
  let component: FormsParent;
  let fixture: ComponentFixture<FormsParent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsParent, ReactiveFormsModule],
      providers: [provideMarkdown(), provideLocalizationMock()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsParent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
