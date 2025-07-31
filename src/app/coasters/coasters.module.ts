import { Module } from '@nestjs/common';
import { CoastersController } from './infrastructure/http/coasters.controller';
import { CoastersService, CoasterPersistenceProvider } from './application';

@Module({
  controllers: [CoastersController],
  providers: [CoastersService, CoasterPersistenceProvider],
  imports: [],
  exports: [],
})
export class CoastersModule {}
