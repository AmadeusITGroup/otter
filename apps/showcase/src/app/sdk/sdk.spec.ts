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
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        Sdk,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        { provide: PetApi, useValue: petApiFixture },
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
