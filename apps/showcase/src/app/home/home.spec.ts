import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  HomeComponent,
} from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideMarkdown(),
        provideDynamicContent()
      ]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
