import { Provider } from '@nestjs/common';
import {
  CoasterRepositoryPort,
  CoasterEventPublisherPort,
  CoasterEventSubscriberPort,
} from '../../core/ports';
import {
  CoasterFileStorageRepositoryAdapter,
  CoasterRedisEventPublisherAdapter,
  CoasterRedisEventSubscriberAdapter,
} from '../../infrastructure/adapters';

export { CoasterRedisGroup } from '../../infrastructure/adapters';
/**
 * Link Port and Adapters
 */
export const CoasterPersistenceProvider: Provider = {
  provide: CoasterRepositoryPort,
  useClass: CoasterFileStorageRepositoryAdapter,
};

export const CoasterEventPublisher: Provider = {
  provide: CoasterEventPublisherPort,
  useClass: CoasterRedisEventPublisherAdapter,
};

export const CoasterEventSubscriber: Provider = {
  provide: CoasterEventSubscriberPort,
  useClass: CoasterRedisEventSubscriberAdapter,
};
