import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ReplaySubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PlaceholderTemplateStore, selectPlaceholderTemplateEntity } from '../../stores/placeholder-template';

/**
 * Placeholder component that is bind to the PlaceholderTemplateStore to display a template based on its ID
 * A loading indication can be provided via projection
 *
 * @example
 *  <o3r-placeholder id="my-template-id">Is loading ...</o3r-placeholder>
 */
@Component({
  selector: 'o3r-placeholder',
  template: '<ng-content *ngIf="isPending; else displayTemplate"></ng-content>' +
    '<ng-template #displayTemplate><div [innerHTML]="template"></div></ng-template>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PlaceholderComponent implements OnInit, OnDestroy {

  private subscription = new Subscription();

  private id$ = new ReplaySubject<string>(1);

  /** Determine if the placeholder content is pending */
  public isPending?: boolean;

  /** Generated HTML template */
  public template?: string;

  /** template identify */
  @Input()
  public set id(value: string) {
    this.id$.next(value);
  }

  constructor(private store: Store<PlaceholderTemplateStore>, private cd: ChangeDetectorRef) {
  }

  /** @inheritdoc */
  public ngOnInit() {
    this.subscription.add(
      this.id$.pipe(
        distinctUntilChanged(),
        switchMap((id) => this.store.pipe(select(selectPlaceholderTemplateEntity, {id})))
      ).subscribe((entity) => {
        if (entity) {
          this.isPending = entity.isPending;
          this.template = entity.renderedTemplate;
        } else {
          this.isPending = false;
          this.template = undefined;
        }
        this.cd.markForCheck();
      })
    );
  }


  /** @inheritdoc */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
