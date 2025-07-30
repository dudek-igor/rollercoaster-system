import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoastersModule } from './coasters/coasters.module';

@Module({
  imports: [CoastersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
