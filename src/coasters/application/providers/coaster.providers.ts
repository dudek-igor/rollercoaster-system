import { Provider } from '@nestjs/common';
import { CoasterRepositoryPort } from '../../core/ports';
import { JsonOrderRepository } from '../../infrastructure/persistence';

export const CoasterPersistenceProvider: Provider = {
  provide: CoasterRepositoryPort,
  useClass: JsonOrderRepository,
};
