import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  type Signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  Store,
} from '@ngrx/store';
import {
  sendOtterMessage,
} from '@o3r/core';
import {
  BehaviorSubject,
  ReplaySubject,
  sample,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';
import {
  type PlaceholderMode,
  PlaceholderTemplateStore,
  selectPlaceholderTemplateMode,
  selectSortedTemplates,
} from '../../stores/placeholder-template';
import {
  PlaceholderLoadingStatus,
  PlaceholderLoadingStatusMessage,
} from './placeholder.interface';

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
    '[class.debug]': `mode() === 'debug'`
  },
  standalone: false
})
export class PlaceholderComponent implements OnInit, OnDestroy, AfterViewChecked {
  public readonly id$ = new BehaviorSubject<string | undefined>(undefined);

  private readonly afterViewInit$ = new Subject<void>();

  private readonly messages$ = new ReplaySubject<PlaceholderLoadingStatus>(1);

  /** Determine if the placeholder content is pending */
  public isPending?: boolean;

  /** Generated HTML template */
  public template?: string;

  public mode: Signal<PlaceholderMode>;

  private readonly destroyRef = inject(DestroyRef);

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
    this.id$.pipe(
      filter((id): id is string => !!id),
      distinctUntilChanged(),
      switchMap((id: string) =>
        this.store.select(selectSortedTemplates(id)).pipe(
          takeUntilDestroyed(this.destroyRef),
          map((placeholders) => ({
            id,
            orderedTemplates: placeholders?.orderedTemplates,
            isPending: placeholders?.isPending
          })),
          distinctUntilChanged((previous, current) =>
            previous.id === current.id
            && previous.isPending === current.isPending
            && previous.orderedTemplates?.map((placeholder) => placeholder.renderedTemplate).join('')
            === current.orderedTemplates?.map((placeholder) => placeholder.renderedTemplate).join('')
          )
        )
      )
    ).subscribe(({ id, orderedTemplates, isPending }) => {
      this.isPending = isPending;
      this.template = orderedTemplates?.length
        // Concatenates the list of templates
        ? orderedTemplates.map((placeholder) => placeholder.renderedTemplate).join('')
        : undefined;
      if (this.isPending === false) {
        this.messages$.next({
          templateIds: this.isPending ? [] : (orderedTemplates || []).map((placeholder) => placeholder.resolvedUrl),
          placeholderId: id
        });
      }
      this.cd.markForCheck();
    });
    this.messages$.pipe(
      takeUntilDestroyed(this.destroyRef),
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
    this.id$.complete();
    this.messages$.complete();
    this.afterViewInit$.complete();
  }
}
