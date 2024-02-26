import { ChangeDetectionStrategy, Component, forwardRef, Input, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-otter-picker-pres',
  standalone: true,
  imports: [NgbDropdownModule],
  templateUrl: './otter-picker-pres.template.html',
  styleUrls: ['./otter-picker-pres.style.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtterPickerPresComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtterPickerPresComponent implements ControlValueAccessor {
  /** ID of the html element used for selection */
  @Input()
  public id!: string;

  /** Currently selected otter */
  public selectedOtter = signal('');

  /** List of available otters */
  public otters = [
    '/assets/otter.svg',
    '/assets/mini-otters/astronotter.svg',
    '/assets/mini-otters/bonotter.svg',
    '/assets/mini-otters/c3potter.svg',
    '/assets/mini-otters/colombotter.svg',
    '/assets/mini-otters/djokotter.svg',
    '/assets/mini-otters/hallowtter.svg',
    '/assets/mini-otters/harry-otter.svg',
    '/assets/mini-otters/jack-sparrowtter.svg',
    '/assets/mini-otters/mandalotter.svg',
    '/assets/mini-otters/mariotter.svg',
    '/assets/mini-otters/neotter.svg',
    '/assets/mini-otters/pizzaiotter.svg',
    '/assets/mini-otters/ronaldotter.svg',
    '/assets/mini-otters/sombrerotter.svg'
  ];

  /** Base URL where the images can be fetched */
  public baseUrl = location.href.split('/#', 1)[0];

  private onChanges!: (val: string) => void;
  private onTouched!: () => void;
  private readonly isDisabled = signal(false);

  /**
   * Select an otter and notify the parent
   * @param otter
   */
  public selectOtter(otter: string) {
    this.selectedOtter.set(otter);
    this.onChanges(otter);
    this.onTouched();
  }

  /**
   * Implements ControlValueAccessor
   * @param fn
   */
  public registerOnChange(fn: any): void {
    this.onChanges = fn;
  }

  /**
   * Implements ControlValueAccessor
   * @param fn
   */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Implements ControlValueAccessor
   * @param isDisabled
   */
  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /**
   * Implements ControlValueAccessor
   * @param obj
   */
  public writeValue(obj: any): void {
    this.selectedOtter.set(obj);
  }

}
