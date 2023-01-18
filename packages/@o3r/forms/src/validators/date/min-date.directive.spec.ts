import { FormControl } from '@angular/forms';
import { utils } from '@dapi/sdk-core';

import { MinDateValidator } from './min-date.directive';

describe('Min Date', () => {
  it('should be invalid compare to tommorrow', () => {
    const minDate = new utils.Date();
    minDate.setDate(minDate.getDate() + 1);
    const c = new FormControl(new utils.Date(), MinDateValidator.minDate(minDate));

    expect(c.status).toBe('INVALID');
  });

  it('should be valid compare to yesterday', () => {
    const minDate = new utils.Date();
    minDate.setDate(minDate.getDate() - 1);
    const c = new FormControl(new utils.Date(), MinDateValidator.minDate(minDate));

    expect(c.status).toBe('VALID');
  });
});
