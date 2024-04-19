import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RulesEngineRunnerModule } from '@o3r/rules-engine';
import { PlaceholderPresComponent } from './placeholder-pres.component';

describe('PlaceholderPresComponent', () => {
  let component: PlaceholderPresComponent;
  let fixture: ComponentFixture<PlaceholderPresComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PlaceholderPresComponent,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot()
      ]
    });
    fixture = TestBed.createComponent(PlaceholderPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
