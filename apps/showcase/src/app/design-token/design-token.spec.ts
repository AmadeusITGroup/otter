import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  DesignToken,
} from './design-token';

describe('DesignToken', () => {
  let component: DesignToken;
  let fixture: ComponentFixture<DesignToken>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(async () => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [
        DesignToken,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown(),
        provideDynamicContent()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DesignToken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
