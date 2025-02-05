import type {
  BasicMessageConsumer,
} from '../managers/interfaces';
import {
  getAvailableConsumers,
} from './available.sender';

describe('getAvailableConsumers', () => {
  it('should return the correct DeclareMessages object', () => {
    const consumers: BasicMessageConsumer[] = [
      // eslint-disable-next-line @typescript-eslint/naming-convention -- version as key identifier
      { type: 'consumer1_type', supportedVersions: { '1.0': () => {}, '2.0': () => {} } },
      // eslint-disable-next-line @typescript-eslint/naming-convention -- version as key identifier
      { type: 'consumer2_type', supportedVersions: { '1.0': () => {} } }
    ];

    const result = getAvailableConsumers(consumers);

    expect(result).toEqual({
      type: 'declare_messages',
      version: '1.0',
      messages: [
        { type: 'consumer1_type', version: '1.0' },
        { type: 'consumer1_type', version: '2.0' },
        { type: 'consumer2_type', version: '1.0' }
      ]
    });
  });

  it('should handle an empty consumers array', () => {
    const consumers: BasicMessageConsumer[] = [];

    const result = getAvailableConsumers(consumers);

    expect(result).toEqual({
      type: 'declare_messages',
      version: '1.0',
      messages: []
    });
  });
});
