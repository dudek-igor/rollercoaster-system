import { Module } from '@nestjs/common';
import { FileStorageModule, RedisModule } from '@/databases';
import { CoastersController } from './infrastructure/http/coasters.controller';
import { CoastersMonitoring } from './infrastructure/monitoring/coasters.monitoring';
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
import { LeaderOnlyGuard } from '@/guard/leader-only.guard';

@Module({
  controllers: [CoastersController],
  providers: [
    /** Guard */
    LeaderOnlyGuard,
    /** DB */
    CoasterPersistenceProvider,
    /** EVENT BUS */
    CoasterRedisGroup,
    CoasterEventPublisher,
    CoasterEventSubscriber,
    /** Monitoring */
    CoastersMonitoring,
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
