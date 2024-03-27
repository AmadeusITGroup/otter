import { PetApi } from '@ama-sdk/showcase-sdk';
import { PetApiFixture } from '@ama-sdk/showcase-sdk/fixtures';
import { AsyncPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { TanstackComponent } from './tanstack.component';
import '@angular/localize/init';

describe('TanstackComponent', () => {
  let component: TanstackComponent;
  let fixture: ComponentFixture<TanstackComponent>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TanstackComponent,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        {provide: PetApi, useValue: petApiFixture}
      ]
    });
    fixture = TestBed.createComponent(TanstackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
