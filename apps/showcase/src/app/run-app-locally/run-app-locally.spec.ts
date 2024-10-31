import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  RunAppLocallyComponent
} from './run-app-locally.component';

describe('RunAppLocallyComponent', () => {
  let component: RunAppLocallyComponent;
  let fixture: ComponentFixture<RunAppLocallyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RunAppLocallyComponent]
    });
    fixture = TestBed.createComponent(RunAppLocallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
