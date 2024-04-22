import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  FormsParentComponent,
} from './forms-parent.component';

describe('FormsParentComponent', () => {
  let component: FormsParentComponent;
  let fixture: ComponentFixture<FormsParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsParentComponent, ...mockTranslationModules(), ReactiveFormsModule],
      providers: [provideMarkdown()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
