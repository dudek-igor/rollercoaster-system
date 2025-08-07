import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_COASTER_STREAM_KEY, REDIS_COASTER_GROUP_NAME } from '@/constants';
import type Redis from 'ioredis';

@Injectable()
export default class CoasterRedisGroup implements OnModuleInit {
  private readonly logger = new Logger(CoasterRedisGroup.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

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
        this.logger.log(`[REDIS - INIT] Error while creating  ${REDIS_COASTER_GROUP_NAME} group.`, {
          err,
        });
      }
    }
  }
}
