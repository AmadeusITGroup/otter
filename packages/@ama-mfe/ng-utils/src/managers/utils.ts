import {
  DestroyRef,
  inject,
} from '@angular/core';
import type {
  MessageProducer,
} from './interfaces';
import {
  ProducerManagerService,
} from './producer.manager.service';

/**
 * Method to call in the constructor of a producer
 * @note should be used in injection context
 * @param producer
 */
export const registerProducer = (producer: MessageProducer) => {
  const producerManagerService = inject(ProducerManagerService);
  producerManagerService.register(producer);

  inject(DestroyRef).onDestroy(() => {
    producerManagerService.unregister(producer);
  });
};
