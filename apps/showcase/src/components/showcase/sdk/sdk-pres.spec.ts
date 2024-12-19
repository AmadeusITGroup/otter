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
  SdkPresComponent,
} from './sdk-pres.component';
import '@angular/localize/init';

describe('SdkPresComponent', () => {
  let component: SdkPresComponent;
  let fixture: ComponentFixture<SdkPresComponent>;
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
      imports: [SdkPresComponent],
      providers: [
        { provide: PetApi, useValue: petApiFixture }
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
