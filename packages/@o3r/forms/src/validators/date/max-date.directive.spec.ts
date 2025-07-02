import {
  utils,
} from '@ama-sdk/core';
import {
  FormControl,
} from '@angular/forms';
import {
  MaxDateValidator,
} from './max-date.directive';

describe('Max Date', () => {
  it('should be valid compare to tommorrow', () => {
    const maxDate = new utils.Date();
    maxDate.setDate(maxDate.getDate() + 1);
    const c = new FormControl(new utils.Date(), MaxDateValidator.maxDate(maxDate));

    expect(c.status).toBe('VALID');
  });

  it('should be invalid compare to yesterday', () => {
    const maxDate = new utils.Date();
    maxDate.setDate(maxDate.getDate() - 1);
    const c = new FormControl(new utils.Date(), MaxDateValidator.maxDate(maxDate));

    expect(c.status).toBe('INVALID');
  });
});
