import { ApiTypes } from '../../fwk/api';
import { RawResponseInfoReply } from './raw-response-info.reply';

describe('Raw response info Reply plugin', () => {

  const reviver = jest.fn();

  it('should add response object', async () => {
    const plugin = new RawResponseInfoReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      response: {headers: new Headers(), test: 'OK'} as any
    });
    const data = {};

    const newData = await runner.transform(data);

    expect(newData.responseInfo).toBeDefined();
    expect(newData.responseInfo.test).toBe('OK');
  });

  it('should keep original data', async () => {
    const plugin = new RawResponseInfoReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      response: {headers: new Headers(), test: 'OK'} as any
    });
    const data = {originalData: 'OK'};

    const newData = await runner.transform(data);

    expect(newData.originalData).toBe('OK');
  });

  it('should invalidate response info', () => {
    const data = {originalData: 'OK'};

    expect(RawResponseInfoReply.hasResponseInfo(data)).toBeFalsy();
  });

  it('should validate response info', () => {
    const data = {originalData: 'OK', responseInfo: {headers: new Headers()}};

    expect(RawResponseInfoReply.hasResponseInfo(data)).toBeTruthy();
  });

});
