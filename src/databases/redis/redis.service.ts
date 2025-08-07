import { Inject, Injectable, OnModuleInit, OnModuleDestroy, LoggerService } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_NODE } from '@/constants';
import type Redis from 'ioredis';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
/**
 * Service responsible for Redis leader election logic.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static readonly LEADER_KEY = 'leader';
  private static readonly TTL_SECONDS = 10;
  private static readonly RENEW_INTERVAL_MS = 5000;

  private readonly instanceId = REDIS_NODE;
  private renewIntervalRef: NodeJS.Timeout | null = null;
  private isLeader = false;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  /**
   * Initializes the module and starts leader election process.
   */
  async onModuleInit(): Promise<void> {
    // await this.startLeaderElection();
  }
  /**
   * Cleans up on module shutdown: clears intervals and releases leadership if held.
   */
  async onModuleDestroy(): Promise<void> {
    this.stopRenewalInterval();

    const currentLeader = await this.redis.get(RedisService.LEADER_KEY);
    if (currentLeader === this.renewIntervalRef) {
      await this.redis.del(RedisService.LEADER_KEY);
      this.logger.log(`[REDIS - LEADER] Leadership released by ${this.instanceId}`);
    }

    await this.redis.quit();
  }
  /**
   * Returns whether the current instance is the leader.
   */
  getIsLeader(): boolean {
    return this.isLeader;
  }
  /**
   * Starts the leader election process and periodically renews leadership.
   */
  private async startLeaderElection(): Promise<void> {
    await this.tryAcquireLeadership();

    this.renewIntervalRef = setInterval(async () => {
      const currentLeader = await this.redis.get(RedisService.LEADER_KEY);

      if (currentLeader === this.instanceId) {
        await this.renewLeadership();
      } else {
        await this.tryAcquireLeadership();
      }
    }, RedisService.RENEW_INTERVAL_MS);
  }

  /**
   * Attempts to acquire leadership using Redis SET NX with TTL.
   */
  private async tryAcquireLeadership(): Promise<void> {
    const result = await this.redis.set(
      RedisService.LEADER_KEY,
      this.instanceId,
      'EX',
      RedisService.TTL_SECONDS,
      'NX',
    );

    if (result === 'OK') {
      this.isLeader = true;
      this.logger.log(`[REDIS - LEADER] Acquired by ${this.instanceId}`);
    } else {
      this.isLeader = false;
      const leader = await this.redis.get(RedisService.LEADER_KEY);
      this.logger.log(`[READIS - LEADER] Currently held by: ${leader}`);
    }
  }
  /**
   * Renews leadership by extending TTL using SET XX.
   */
  private async renewLeadership(): Promise<void> {
    await this.redis.set(
      RedisService.LEADER_KEY,
      this.instanceId,
      'EX',
      RedisService.TTL_SECONDS,
      'XX',
    );

    this.isLeader = true;
    this.logger.log(`[REDIS - LEADER] TTL renewed by ${this.instanceId}`);
  }
  /**
   * Clears the leadership renewal interval if active.
   */
  private stopRenewalInterval(): void {
    if (this.renewIntervalRef) {
      clearInterval(this.renewIntervalRef);
      this.renewIntervalRef = null;
    }
  }
}
