import { PetApi } from '@ama-sdk/showcase-sdk';
import { PetApiFixture } from '@ama-sdk/showcase-sdk/fixtures';
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
        RouterModule.forRoot([])
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
