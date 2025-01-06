import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  DesignTokenComponent,
} from './design-token.component';

describe('DesignTokenComponent', () => {
  let component: DesignTokenComponent;
  let fixture: ComponentFixture<DesignTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DesignTokenComponent,
        RouterModule.forRoot([])
      ],
      providers: [provideMarkdown()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DesignTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
