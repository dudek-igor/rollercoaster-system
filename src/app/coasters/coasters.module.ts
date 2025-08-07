import { Module } from '@nestjs/common';
import { FileStorageModule, RedisModule } from '@/databases';
import { CoastersController } from './infrastructure/http/coasters.controller';
import {
  CoasterRedisGroup,
  CoasterPersistenceProvider,
  CoasterEventPublisher,
  CoasterEventSubscriber,
} from './application/providers/coaster.providers';
import {
  AddWagonToCoasterUseCase,
  CreateCoasterUseCase,
  RemoveWagonUseCase,
  UpdateCoasterUseCase,
  FindAllUnpublishCoaster,
} from './application/use-cases';

@Module({
  controllers: [CoastersController],
  providers: [
    /** DB */
    CoasterPersistenceProvider,
    /** EVENT BUS */
    CoasterRedisGroup,
    CoasterEventPublisher,
    CoasterEventSubscriber,
    /** Use Cases */
    CreateCoasterUseCase,
    AddWagonToCoasterUseCase,
    RemoveWagonUseCase,
    UpdateCoasterUseCase,
    FindAllUnpublishCoaster,
  ],
  imports: [FileStorageModule, RedisModule],
  exports: [],
})
export class CoastersModule {}
