import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ConfigurationPres,
} from './configuration-pres';

describe('ConfigurationPres', () => {
  let component: ConfigurationPres;
  let fixture: ComponentFixture<ConfigurationPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AsyncPipe, ConfigurationPres]
    });
    fixture = TestBed.createComponent(ConfigurationPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
