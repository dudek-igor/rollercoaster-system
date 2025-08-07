import { Inject, Injectable, OnModuleInit, type LoggerService } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_COASTER_STREAM_KEY, REDIS_COASTER_GROUP_NAME } from '@/constants';
import type Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export default class CoasterRedisGroup implements OnModuleInit {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.ensureConsumerGroup();
  }
  /**
   * Creating a consumer group (if it doesn't exist).
   */
  private async ensureConsumerGroup() {
    try {
      await this.redis.xgroup(
        'CREATE',
        REDIS_COASTER_STREAM_KEY,
        REDIS_COASTER_GROUP_NAME,
        '$',
        'MKSTREAM',
      );
      this.logger.log(`[REDIS - INIT] Group ${REDIS_COASTER_GROUP_NAME} created.`);
    } catch (err) {
      if (err.message.includes('BUSYGROUP')) {
        this.logger.log(`[REDIS - INIT] Group ${REDIS_COASTER_GROUP_NAME} already exists.`);
      } else {
        throw err;
      }
    }
  }
}
