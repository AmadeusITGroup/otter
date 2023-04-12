import type {IMock} from '@amadeus-it-group/kassette';
import {Temporal} from 'temporal-polyfill';

/**
 * Options to be passed to `updateDatesInMocks`
 */
export interface UpdateDatesInMocksOptions {
  /**
   * 'any': dates in inputs will be ignored when computing checksum, the dates on the output will be updated to keep the same day offset
   * 'day-offset': dates in inputs will be converted to day offsets, the dates on the output will be updated to keep the same day offset
   * 'same-day-of-week': dates in inputs will be converted to day of week, the dates on the output will be updated to keep the same day of week but increment the week
   */
  mode: 'any' | 'day-offset' | 'same-day-of-week';
  /**
   * RegExp used to extract dates from request and response
   */
  extractor: RegExp;
  /**
   * Functions to be used to convert from Temporal objects to strings, and strings to temporal objects
   */
  converter: {
    /**
     * Converter from Temporal to string
     *
     * @param input
     */
    fromDate: (input: Temporal.ZonedDateTime | Temporal.PlainDate) => string;
    /**
     * Converter from string to Temporal
     *
     * @param input
     */
    toDate: (input: string) => Temporal.ZonedDateTime | Temporal.PlainDate;
  };
}

/**
 * Update mock checksum and response body to keep using the same mocks every day with updated dates
 *
 * @param mock the mock instance provided by the hook method of Kassette
 * @param inputOptions default options will extract ISO strings and use 'day-offset' mode
 */
export async function updateDatesInMocks(mock: IMock, inputOptions: Partial<UpdateDatesInMocksOptions> = {}) {
  const plainDateLength = 'YYYY-MM-DDThh:mm:ss'.length;
  const options: UpdateDatesInMocksOptions = {
    mode: 'day-offset',
    extractor: /\b(\d{4}-\d{2}-\d{2})[^"]*/g,
    converter: {
      fromDate: (date) => date.toString().substring(0, plainDateLength),
      toDate: (input) => {
        input = input.replace(/\.\d+/, '').replace(/Z/, '+00:00');
        return input.length > plainDateLength ?
          Temporal.ZonedDateTime.from(`${input.replace(/(\.\d+)/, '')}[${input.replace(/^.*(\+\d{2}:\d{2}).*$/, '$1') || '+00:00'}]`) :
          Temporal.PlainDate.from(input);
      }
    },
    ...inputOptions
  };
  const todayTime = Temporal.Now.plainDateISO();

  // Update request
  const replaceDatesInInput = (input: string): string => {
    switch (options.mode) {
      case 'any':
        return input.replace(options.extractor, '<any>');
      case 'day-offset':
        return input.replace(options.extractor, (match) => `<t+${Temporal.PlainDate.from(todayTime).until(options.converter.toDate(match)).toString()}>`);
      case 'same-day-of-week':
        return input.replace(options.extractor, (match) => `<day ${options.converter.toDate(match).dayOfWeek} next week>`);
    }
    return input;
  };
  const checksum = await mock.checksum({
    headers: false,
    body: {filter: (body) => replaceDatesInInput(body.toString())},
    query: {filter: (params) => Object.fromEntries(Object.entries(params).map(([key, value]) => [key, replaceDatesInInput(value)]))},
    customData: {updateDatesMode: options.mode}
  });
  mock.setLocalPath([mock.localPath, checksum]);

  // Update response
  if (/get|post/.test(mock.request.method) && (await mock.hasLocalMock())) {
    const localPayload = (await mock.readLocalPayload())?.payload;
    if (localPayload && localPayload.data.creationDateTime) {
      const referenceTime = Temporal.PlainDate.from(localPayload.data.creationDateTime.toISOString().substring(0, 10));
      const timeOffset = Temporal.PlainDate.from(referenceTime).until(todayTime, {smallestUnit: 'days', largestUnit: 'days'});
      if (timeOffset.days !== 0) {
        mock.setMode('manual');
        const replaceDatesInOutput = (output: string): string => {
          switch (options.mode) {
            case 'any':
            case 'day-offset':
              return output.replace(options.extractor, (match) => options.converter.fromDate(options.converter.toDate(match).add(timeOffset)));
            case 'same-day-of-week':
              return output.replace(options.extractor, (match) => options.converter.fromDate(options.converter.toDate(match).add(`P${Math.ceil(timeOffset.days / 7)}W`)));
          }
          return output;
        };
        const wrappedPayload = mock.createPayload({
          data: localPayload.data,
          body: replaceDatesInOutput(localPayload.body?.toString() || '')
        });
        mock.fillResponseFromPayload(wrappedPayload);
        await mock.sendResponse();
      }
    }
  }
}
