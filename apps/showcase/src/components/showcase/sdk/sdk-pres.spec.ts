import { PetApi } from '@ama-sdk/showcase-sdk';
import { PetApiFixture } from '@ama-sdk/showcase-sdk/fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkPresComponent } from './sdk-pres.component';
import '@angular/localize/init';

describe('SdkPresComponent', () => {
  let component: SdkPresComponent;
  let fixture: ComponentFixture<SdkPresComponent>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SdkPresComponent],
      providers: [
        {provide: PetApi, useValue: petApiFixture}
      ]
    });
    fixture = TestBed.createComponent(SdkPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
