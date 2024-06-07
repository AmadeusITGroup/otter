import { ApiTypes } from '../../fwk/api';
import { ReviverReply } from './reviver.reply';

describe('Reviver Reply Plugin', () => {

  const reviver = jest.fn();

  it('should revive a specific data', async () => {
    const plugin = new ReviverReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      response: {} as any
    });
    const data = {};

    await runner.transform(data);

    expect(reviver).toHaveBeenCalledWith(data, undefined, expect.any(Object));
  });

  it('should revive a specific data and dictionary', async () => {
    const dictionaries = {};
    const plugin = new ReviverReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      dictionaries,
      response: {} as any
    });
    const data = {};

    await runner.transform(data);

    expect(reviver).toHaveBeenCalledWith(data, dictionaries, expect.any(Object));
  });

  it('should revive empty object in case of undefined data', async () => {
    const dictionaries = {};
    const plugin = new ReviverReply();
    const runner = plugin.load({
      reviver,
      apiType: ApiTypes.DEFAULT,
      dictionaries,
      response: {} as any
    });

    const transformedData = await runner.transform(undefined);

    expect(transformedData).toEqual({});
  });
});
