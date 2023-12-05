import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';

import { ApplicationDevtoolsModule } from '@o3r/application';
import { ComponentsDevtoolsModule } from '@o3r/components';
import { EffectsModule } from '@ngrx/effects';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ApplicationDevtoolsModule,
      ComponentsDevtoolsModule,
      StoreModule.forRoot(),
      EffectsModule.forRoot()
    ],
    providers: [
      provideMockStore()
    ],
    declarations: [AppComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
