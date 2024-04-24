import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {Store} from '@ngrx/store';
import {BehaviorSubject, ReplaySubject, sample, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {PlaceholderTemplateStore, selectSortedTemplates} from '../../stores/placeholder-template';
import {PlaceholderLoadingStatus, PlaceholderLoadingStatusMessage} from './placeholder.interface';
import {sendOtterMessage} from '@o3r/core';

/**
 * Placeholder component that is bind to the PlaceholderTemplateStore to display a template based on its ID
 * A loading indication can be provided via projection
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

  private readonly subscription = new Subscription();

  private readonly id$ = new BehaviorSubject<string | undefined>(undefined);

  private readonly afterViewInit$ = new Subject<void>();

  private readonly messages$ = new ReplaySubject<PlaceholderLoadingStatus>(1);

  /** Determine if the placeholder content is pending */
  public isPending?: boolean;

  /** Generated HTML template */
  public template?: string;

  /** template identify */
  @Input()
  public set id(value: string) {
    this.id$.next(value);
  }

  constructor(private readonly store: Store<PlaceholderTemplateStore>, private readonly cd: ChangeDetectorRef) {
  }

  /** @inheritdoc */
  public ngOnInit() {
    this.subscription.add(
      this.id$.pipe(
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        switchMap((id: string) =>
          this.store.select(selectSortedTemplates(id)).pipe(
            map((placeholders) => ({
              id,
              orderedTemplates: placeholders?.orderedTemplates,
              isPending: placeholders?.isPending
            })),
            distinctUntilChanged((previous, current) =>
              previous.id === current.id &&
              previous.isPending === current.isPending &&
              previous.orderedTemplates?.map(placeholder => placeholder.renderedTemplate).join('') ===
              current.orderedTemplates?.map(placeholder => placeholder.renderedTemplate).join('')
            )
          )
        )
      ).subscribe(({id, orderedTemplates, isPending}) => {
        this.isPending = isPending;
        if (!orderedTemplates?.length) {
          this.template = undefined;
        } else {
          // Concatenates the list of templates
          this.template = orderedTemplates.map(placeholder => placeholder.renderedTemplate).join('');
        }
        if (this.isPending === false) {
          this.messages$.next({
            templateIds: !this.isPending ? (orderedTemplates || []).map(placeholder => placeholder.resolvedUrl) : [],
            placeholderId: id
          });
        }
        this.cd.markForCheck();
      })
    );
    this.messages$.pipe(
      sample(this.afterViewInit$),
      distinctUntilChanged((previous, current) => JSON.stringify(current) === JSON.stringify(previous))
    ).subscribe({
      next: (data) =>
        sendOtterMessage<PlaceholderLoadingStatusMessage>('placeholder-loading-status', data, false),
      complete: () =>
        sendOtterMessage<PlaceholderLoadingStatusMessage>('placeholder-loading-status', {
          placeholderId: this.id$.value,
          templateIds: []
        }, false)
    });
  }

  public ngAfterViewChecked() {
    // Make sure the view is rendered before posting the status
    this.afterViewInit$.next();
  }

  /** @inheritdoc */
  public ngOnDestroy() {
    this.messages$.complete();
    this.afterViewInit$.complete();
    this.subscription.unsubscribe();
  }
}
