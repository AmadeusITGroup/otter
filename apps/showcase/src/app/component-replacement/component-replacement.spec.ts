import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  ComponentReplacementPres,
} from '../../components/showcase/component-replacement/component-replacement-pres';
import {
  ComponentReplacement,
} from './component-replacement';

describe('ComponentReplacement', () => {
  let component: ComponentReplacement;
  let fixture: ComponentFixture<ComponentReplacement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ComponentReplacement,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [provideMarkdown()]
    }).overrideComponent(ComponentReplacement, {
      remove: { imports: [ComponentReplacementPres] }
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentReplacement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
