import {
  DestroyRef,
  inject,
} from '@angular/core';
import {
  ConsumerManagerService,
} from './consumer.manager.service';
import type {
  MessageConsumer,
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

/**
 * Method to call in the constructor of a consumer
 * @note should be used in injection context
 * @param consumer
 */
export const registerConsumer = (consumer: MessageConsumer) => {
  const consumerManagerService = inject(ConsumerManagerService);
  consumerManagerService.register(consumer);

  inject(DestroyRef).onDestroy(() => {
    consumerManagerService.unregister(consumer);
  });
};
