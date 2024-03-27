import { PetApi } from '@ama-sdk/showcase-sdk';
import { PetApiFixture } from '@ama-sdk/showcase-sdk/fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TanstackPresComponent } from './tanstack-pres.component';
import '@angular/localize/init';

describe('SdkPresComponent', () => {
  let component: TanstackPresComponent;
  let fixture: ComponentFixture<TanstackPresComponent>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TanstackPresComponent],
      providers: [
        {provide: PetApi, useValue: petApiFixture}
      ]
    });
    fixture = TestBed.createComponent(TanstackPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
