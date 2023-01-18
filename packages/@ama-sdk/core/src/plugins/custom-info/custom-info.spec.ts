import {ApiTypes} from '../../fwk/api';
import {CustomInfoReply} from './custom-info.reply';

describe('Custom info reply plugin', () => {

  it('should add the content of the custom information in the reply', async () => {
    const customInfo = {
      key: 'value',
      nested: {
        field: 10
      }
    };

    const plugin = new CustomInfoReply(customInfo);
    const runner = plugin.load({
      apiType: ApiTypes.DEFAULT,
      response: {} as any
    });

    const newData = await runner.transform({});

    expect(newData.customInfo).toEqual({
      key: 'value',
      nested: {
        field: 10
      }
    });
  });

  it('should merge the contents of the two custom info', async () => {
    const customInfo1 = {key0: 'dummy', key1: 'value'};
    const plugin1 = new CustomInfoReply(customInfo1);

    const customInfo2 = {key1: 'override', key2: 42};
    const plugin2 = new CustomInfoReply(customInfo2);

    const runner1 = plugin1.load({
      apiType: ApiTypes.DEFAULT,
      response: {} as any
    });

    const runner2 = plugin2.load({
      apiType: ApiTypes.DEFAULT,
      response: {} as any
    });

    const newData = await runner2.transform(await runner1.transform({}));

    expect(newData.customInfo).toEqual({
      key0: 'dummy',
      key1: 'override',
      key2: 42
    });
  });

  it('should invalidate custom info', () => {
    const plugin = new CustomInfoReply({});
    const data = {originalData: 'OK'};

    expect(plugin.hasCustomInfo(data)).toBeFalsy();
  });

  it('should validate custom info', () => {
    const plugin = new CustomInfoReply({});
    const data = {originalData: 'OK', customInfo: {a: 'b'}};

    expect(plugin.hasCustomInfo(data)).toBeTruthy();
  });
});
