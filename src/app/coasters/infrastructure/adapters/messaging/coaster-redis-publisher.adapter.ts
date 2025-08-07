import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_COASTER_STREAM_KEY, REDIS_COASTER_EVENT_NAME } from '@/constants';
import type Redis from 'ioredis';
import { CoasterEventPublisherPort } from '../../../core/ports';
import { FindAllUnpublishCoaster } from '@/app/coasters/application/use-cases';
import { Coaster } from '@/app/coasters/core/entities';

@Injectable()
export default class CoasterRedisEventPublisherAdapter
  implements OnModuleInit, CoasterEventPublisherPort
{
  private readonly logger = new Logger(CoasterRedisEventPublisherAdapter.name);

  constructor(
    private readonly findAllUnpublishCoaster: FindAllUnpublishCoaster,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    this.redis.once('ready', async () => {
      await this.synchronize();
      await this.fallback();
    });
  }

  async publish(coaster: Coaster): Promise<boolean> {
    try {
      await this.redis.xadd(
        REDIS_COASTER_STREAM_KEY,
        '*',
        'type',
        REDIS_COASTER_EVENT_NAME,
        'payload',
        JSON.stringify(coaster.toJSON()),
      );
      this.logger.log(`[REDIS - PUBLISH] event sent.`);
      return true;
    } catch (error) {
      this.logger.error(`[REDIS - PUBLISH] Failed to publish event: ${error.message}`);
      return false;
    }
  }

  async synchronize() {
    try {
      // await this.ensureConsumerGroup();

      const unpublishCoasters = await this.findAllUnpublishCoaster.execute();

      for (const coaster of unpublishCoasters) {
        await this.publish(coaster);
      }

      this.logger.log(`[REDIS - SYNC] Synchronization publish completed.`);
    } catch (err) {
      this.logger.error('[REDIS - SYNC] Error during synchronization:', err.message);
    }
  }

  async fallback() {
    this.redis.on('reconnecting', () => {
      this.logger.warn('[REDIS PUBLISHER FALLBACK] Attempting to reconnect...');
    });
    this.redis.on('ready', async () => {
      this.logger.warn(
        '[REDIS PUBLISHER FALLBACK] Connection reestablished. Resync and restart polling...',
      );
      await this.synchronize();
    });
  }
}
