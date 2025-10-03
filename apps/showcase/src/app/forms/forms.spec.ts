import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  Forms,
} from './forms';

describe('Forms', () => {
  let component: Forms;
  let fixture: ComponentFixture<Forms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), Forms, ...mockTranslationModules()],
      providers: [provideMarkdown()]
    }).compileComponents();

    fixture = TestBed.createComponent(Forms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
