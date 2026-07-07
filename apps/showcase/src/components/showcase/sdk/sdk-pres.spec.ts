import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  PetApi,
} from '@o3r-training/showcase-sdk';
import {
  PetApiFixture,
} from '@o3r-training/showcase-sdk/fixtures';
import {
  SdkPres,
} from './sdk-pres';
import '@angular/localize/init';

describe('SdkPres', () => {
  let component: SdkPres;
  let fixture: ComponentFixture<SdkPres>;
  const petApiFixture = new PetApiFixture();
  petApiFixture.findPetsByStatus = petApiFixture.findPetsByStatus.mockResolvedValue([]);

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      headers: {},
      redirected: false,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('')
    } as Response));

    TestBed.configureTestingModule({
      imports: [SdkPres],
      providers: [
        { provide: PetApi, useValue: petApiFixture }
      ]
    });
    fixture = TestBed.createComponent(SdkPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
