import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {delay, merge, of, Subject, switchMap} from 'rxjs';

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
  encapsulation: ViewEncapsulation.None
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

  public shouldLimitCharactersForOldValue = true;
  public isClipBoardFeatureAvailableForOldValue = false;

  private triggerNotification = new Subject<void>();
  public showNotification$ = this.triggerNotification.asObservable().pipe(
    switchMap(() => merge(of(true), of(false).pipe(delay(NOTIFICATION_DURATION))))
  );

  public ngOnChanges({value, oldValue}: SimpleChanges) {
    if (value && value.currentValue !== value.previousValue) {
      this.isClipBoardFeatureAvailableForValue = this.isClipBoardFeatureAvailable(value?.currentValue);
    }
    if (oldValue && oldValue.currentValue !== oldValue.previousValue) {
      this.isClipBoardFeatureAvailableForOldValue = this.isClipBoardFeatureAvailable(oldValue?.currentValue);
    }
  }

  public isClipBoardFeatureAvailable(value: string | undefined) {
    return !!(navigator.clipboard && value && value.length > CLIPBOARD_FEATURE_LENGTH_THRESHOLD);
  }

  public async copyToClipBoard(content: string) {
    await navigator.clipboard.writeText(content);
    this.triggerNotification.next();
  }
}
