import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  ComponentReplacementPresComponent,
} from '../../components/showcase/component-replacement/component-replacement-pres.component';
import {
  ComponentReplacementComponent,
} from './component-replacement.component';

describe('ComponentReplacementComponent', () => {
  let component: ComponentReplacementComponent;
  let fixture: ComponentFixture<ComponentReplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentReplacementComponent,
        RouterModule.forRoot([]),
        AsyncPipe]
    }).overrideComponent(ComponentReplacementComponent, {
      remove: { imports: [ComponentReplacementPresComponent] }
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentReplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
