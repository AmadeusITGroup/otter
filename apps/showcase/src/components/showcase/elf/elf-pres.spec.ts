import { PetApi } from '@ama-sdk/showcase-sdk';
import { PetApiFixture } from '@ama-sdk/showcase-sdk/fixtures';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElfPresComponent } from './elf-pres.component';
import '@angular/localize/init';

describe('ElfPresComponent', () => {
  let component: ElfPresComponent;
  let fixture: ComponentFixture<ElfPresComponent>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ElfPresComponent],
      providers: [
        {provide: PetApi, useValue: petApiFixture}
      ]
    });
    fixture = TestBed.createComponent(ElfPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
