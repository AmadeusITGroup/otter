import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  type Signal,
  ViewEncapsulation
} from '@angular/core';
import {Store} from '@ngrx/store';
import {sendOtterMessage} from '@o3r/core';
import {BehaviorSubject, ReplaySubject, sample, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {type PlaceholderMode, PlaceholderTemplateStore, selectPlaceholderTemplateMode, selectSortedTemplates} from '../../stores/placeholder-template';
import {PlaceholderLoadingStatus, PlaceholderLoadingStatusMessage} from './placeholder.interface';

/**
 * Placeholder component that is bind to the PlaceholderTemplateStore to display a template based on its ID
 * A loading indication can be provided via projection
 * @example
 *  <o3r-placeholder id="my-template-id">Is loading ...</o3r-placeholder>
 */
@Component({
  selector: 'o3r-placeholder',
  templateUrl: './placeholder.template.html',
  styleUrl: './placeholder.style.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '[class.debug]': `mode() === 'debug'`
  }
})
export class PlaceholderComponent implements OnInit, OnDestroy {

  private readonly subscription = new Subscription();

  public readonly id$ = new BehaviorSubject<string | undefined>(undefined);

  private readonly afterViewInit$ = new Subject<void>();

  private readonly messages$ = new ReplaySubject<PlaceholderLoadingStatus>(1);

  /** Determine if the placeholder content is pending */
  public isPending?: boolean;

  /** Generated HTML template */
  public template?: string;

  public mode: Signal<PlaceholderMode>;

  /** template identify */
  @Input()
  public set id(value: string) {
    this.id$.next(value);
  }

  constructor(private readonly store: Store<PlaceholderTemplateStore>, private readonly cd: ChangeDetectorRef) {
    this.mode = this.store.selectSignal(selectPlaceholderTemplateMode);
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
