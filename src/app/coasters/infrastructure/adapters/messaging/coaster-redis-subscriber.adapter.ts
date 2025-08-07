import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { FileStorageService } from '@/databases/file-storage/file-storage.service';
import type { Redis } from 'ioredis';
import {
  REDIS_CLIENT,
  REDIS_NODE,
  REDIS_COASTER_STREAM_KEY,
  REDIS_COASTER_GROUP_NAME,
  REDIS_COASTER_EVENT_NAME,
  REDIS_STREAM_FALLBACK_FILE,
} from '@/constants';
import { CoasterEventSubscriberPort } from '../../../core/ports';
import { Coaster } from '@/app/coasters/core/entities';
import { CreateCoasterUseCase } from '@/app/coasters/application/use-cases';

@Injectable()
export default class CoasterRedisEventSubscriberAdapter
  implements OnModuleInit, CoasterEventSubscriberPort
{
  private readonly logger = new Logger(CoasterRedisEventSubscriberAdapter.name);

  constructor(
    private readonly fileStorage: FileStorageService,
    private readonly createCoasterUseCase: CreateCoasterUseCase,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    this.redis.once('ready', async () => {
      await this.synchronize();
      await this.subscribe();
      await this.fallback();
    });
  }

  /**
   * Synchronization of historical events
   */
  async synchronize() {
    try {
      const lastId = await this.loadLastProcessedId();
      const entries = await this.redis.xrange(REDIS_COASTER_STREAM_KEY, lastId, '+');
      for (const [id, fields] of entries) {
        if (id !== lastId) await this.handleEvent(id, fields);
      }
      this.logger.log(`[REDIS - SYNC] Synchronization subscriber completed.`);
    } catch (err) {
      this.logger.log(`[REDIS - SYNC] Synchronization error.`, { err });
    }
  }
  /**
   * Subscription to current events (asynchronous loop)
   */
  async subscribe() {
    try {
      const response = (await this.redis.xreadgroup(
        'GROUP',
        REDIS_COASTER_GROUP_NAME,
        REDIS_NODE,
        'COUNT',
        10,
        'BLOCK',
        1000,
        'STREAMS',
        REDIS_COASTER_STREAM_KEY,
        '>',
      )) as [string, [string, string[]][]][] | null;

      if (response) {
        for (const [, messages] of response) {
          for (const [id, fields] of messages) {
            await this.handleEvent(id, fields);
          }
        }
      }
      setImmediate(async () => await this.subscribe());
    } catch (err) {
      this.logger.error('[REDIS - SUBSCRIBER] Error occurred');
    }
  }

  async fallback() {
    this.redis.on('reconnecting', () => {
      this.logger.warn('[REDIS SUBSCRIBER FALLBACK] Attempting to reconnect...');
    });
    this.redis.on('ready', async () => {
      this.logger.warn(
        '[REDIS SUBSCRIBER FALLBACK] Connection reestablished. Resync and restart polling...',
      );
      await this.synchronize();
      await this.subscribe();
    });
  }
  /**
   * Event handling
   */
  private async handleEvent(id: string, fields: string[]) {
    try {
      const typeIndex = fields.findIndex((f) => f === 'type');
      const payloadIndex = fields.findIndex((f) => f === 'payload');
      if (typeIndex === -1 || payloadIndex === -1) return;
      const eventType = fields[typeIndex + 1];
      const payload = JSON.parse(fields[payloadIndex + 1]);
      if (eventType === REDIS_COASTER_EVENT_NAME) {
        const coaster = Coaster.create(payload);
        coaster.adjustPublished(true); // Set publish to true
        await this.createCoasterUseCase.save(coaster); // Save coaster
        await this.saveLastProcessedId(id); // Save last processed id as a fallback to file
        await this.redis.xack(REDIS_COASTER_STREAM_KEY, REDIS_COASTER_GROUP_NAME, id); // Confirm read from stream
      }
      this.logger.log('[REDIS - EVENT] event has been processed');
    } catch (err) {
      this.logger.error('[REDIS - EVENT] Błąd parsowania:', err);
    }
  }
  /**
   * Read synchronization offset from file
   */
  private async loadLastProcessedId(): Promise<string> {
    try {
      const data = await this.fileStorage.readJson<{ streamLastId: string }>(
        REDIS_STREAM_FALLBACK_FILE,
      );
      return data?.streamLastId ?? '0';
    } catch {
      return '0';
    }
  }
  /**
   * Write synchronization offset to file
   */
  private async saveLastProcessedId(streamLastId: string): Promise<void> {
    this.fileStorage.saveJson(REDIS_STREAM_FALLBACK_FILE, { streamLastId });
  }
}
