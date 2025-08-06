import { Provider } from '@nestjs/common';
import CoasterRepositoryPort from '../../core/ports/coaster-repository.port';
import CoasterFileStorageRepositoryAdapter from '../../infrastructure/persistence/coaster-file-storage-adapter';
/**
 * Link Port and Adapters
 */
export const CoasterPersistenceProvider: Provider = {
  provide: CoasterRepositoryPort,
  useClass: CoasterFileStorageRepositoryAdapter,
};
