import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideRouter,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
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
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(async () => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [
        ComponentReplacement,
        AsyncPipe
      ],
      providers: [
        provideRouter([]),
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown()
      ]
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
