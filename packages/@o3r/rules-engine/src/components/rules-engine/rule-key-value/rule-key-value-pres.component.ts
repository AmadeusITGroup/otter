import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  of,
  Subject,
} from 'rxjs';
import {
  delay,
  startWith,
  switchMap,
} from 'rxjs/operators';

/**
 * Duration of the notification for clipboard feature (in milliseconds)
 */
const NOTIFICATION_DURATION = 1750;

/**
 * Minimal length required to enable clipboard feature
 */
const CLIPBOARD_FEATURE_LENGTH_THRESHOLD = 80;

@Component({
  selector: 'o3r-rule-key-value-pres',
  styleUrls: ['./rule-key-value-pres.style.scss'],
  templateUrl: './rule-key-value-pres.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class RuleKeyValuePresComponent implements OnChanges {
  /**
   * Key of the object (name of the fact for example)
   */
  @Input()
  public key?: string;

  /**
   * Current value of the object
   */
  @Input()
  public value!: string;

  /**
   * Previous value of the object
   */
  @Input()
  public oldValue?: string;

  /**
   * Type of display:
   * - 'state':      `key: value`, `key: oldValue -> value` or `oldValue -> value`
   * - 'assignment': `key = value`
   */
  @Input()
  public type: 'state' | 'assignment' = 'state';

  public shouldLimitCharactersForValue = true;
  public isClipBoardFeatureAvailableForValue = false;
  public isValuePrimitiveType = false;

  public shouldLimitCharactersForOldValue = true;
  public isClipBoardFeatureAvailableForOldValue = false;
  public isOldValuePrimitiveType = false;

  private readonly triggerNotification = new Subject<void>();
  public showNotification$ = this.triggerNotification.asObservable().pipe(
    switchMap(() => of(false).pipe(delay(NOTIFICATION_DURATION), startWith(true)))
  );

  private isClipBoardFeatureAvailable(value: string | undefined) {
    return !!(navigator.clipboard && value && value.length > CLIPBOARD_FEATURE_LENGTH_THRESHOLD);
  }

  public ngOnChanges({ value, oldValue }: SimpleChanges) {
    if (value) {
      this.isValuePrimitiveType = value.currentValue === null || typeof value.currentValue !== 'object';
      this.isClipBoardFeatureAvailableForValue = this.isClipBoardFeatureAvailable(this.isValuePrimitiveType ? String(value.currentValue) : JSON.stringify(value.currentValue));
    }
    if (oldValue) {
      this.isOldValuePrimitiveType = oldValue.currentValue === null || typeof oldValue.currentValue !== 'object';
      this.isClipBoardFeatureAvailableForOldValue = this.isClipBoardFeatureAvailable(this.isOldValuePrimitiveType ? String(oldValue.currentValue) : JSON.stringify(oldValue.currentValue));
    }
  }

  public async copyToClipBoard(content: string) {
    await navigator.clipboard.writeText(content);
    this.triggerNotification.next();
  }
}
