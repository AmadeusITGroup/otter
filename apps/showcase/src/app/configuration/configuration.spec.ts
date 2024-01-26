import { AsyncPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { ConfigurationComponent } from './configuration.component';
import { O3rElement } from '@o3r/testing/core';
import { ConfigurationFixtureComponent } from './configuration.fixture';
let componentFixture: ConfigurationFixtureComponent;

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ConfigurationComponent,
        StoreModule.forRoot(),
        RouterModule.forRoot([]),
        AsyncPipe
      ]
    });
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;

    componentFixture = new ConfigurationFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
