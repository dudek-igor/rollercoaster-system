import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoastersModule } from '@/app';
import { RedisModule, FileStorageModule } from '@/databases';
import { validate } from '@/config';
import { LoggerModule } from '@/tools';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    RedisModule,
    FileStorageModule,
    CoastersModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
