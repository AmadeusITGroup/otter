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
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  PetApi,
} from '@o3r-training/showcase-sdk';
import {
  PetApiFixture,
} from '@o3r-training/showcase-sdk/fixtures';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  Sdk,
} from './sdk';
import '@angular/localize/init';

describe('Sdk', () => {
  let component: Sdk;
  let fixture: ComponentFixture<Sdk>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [
        Sdk,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        { provide: PetApi, useValue: petApiFixture },
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown()
      ]
    });
    fixture = TestBed.createComponent(Sdk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
