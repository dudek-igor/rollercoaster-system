import { Module } from '@nestjs/common';
import { FileStorageModule } from '@/databases';
import { CoastersController } from './infrastructure/http/coasters.controller';
import { CoasterPersistenceProvider } from './application/providers/coaster.providers';
import {
  AddWagonToCoasterUseCase,
  CreateCoasterUseCase,
  RemoveWagonUseCase,
  UpdateCoasterUseCase,
} from './application/use-cases';

@Module({
  controllers: [CoastersController],
  providers: [
    /** DB */
    CoasterPersistenceProvider,
    /** Services */
    CreateCoasterUseCase,
    AddWagonToCoasterUseCase,
    RemoveWagonUseCase,
    UpdateCoasterUseCase,
  ],
  imports: [FileStorageModule],
  exports: [],
})
export class CoastersModule {}
