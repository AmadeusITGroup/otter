import { PetApi } from '@o3r-training/showcase-sdk';
import { PetApiFixture } from '@o3r-training/showcase-sdk/fixtures';
import { AsyncPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { SdkComponent } from './sdk.component';
import '@angular/localize/init';

describe('SdkComponent', () => {
  let component: SdkComponent;
  let fixture: ComponentFixture<SdkComponent>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SdkComponent,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        {provide: PetApi, useValue: petApiFixture}
      ]
    });
    fixture = TestBed.createComponent(SdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
