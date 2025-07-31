import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { REDIS_CLIENT } from '@/constants';
import type Redis from 'ioredis';
/**
 * Service responsible for Redis leader election logic.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static readonly LEADER_KEY = 'leader';
  private static readonly TTL_SECONDS = 10;
  private static readonly RENEW_INTERVAL_MS = 5000;

  private instanceId = `node-${Math.random().toString(36).substring(2, 8)}`;
  private renewIntervalRef: NodeJS.Timeout | null = null;
  private isLeader = false;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Initializes the module and starts leader election process.
   */
  async onModuleInit(): Promise<void> {
    await this.startLeaderElection();
  }
  /**
   * Cleans up on module shutdown: clears intervals and releases leadership if held.
   */
  async onModuleDestroy(): Promise<void> {
    this.stopRenewalInterval();

    const currentLeader = await this.redis.get(RedisService.LEADER_KEY);
    if (currentLeader === this.renewIntervalRef) {
      await this.redis.del(RedisService.LEADER_KEY);
      console.log(`[LEADER] Leadership released by ${this.instanceId}`);
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
      console.log(`[LEADER] Acquired by ${this.instanceId}`);
    } else {
      this.isLeader = false;
      const leader = await this.redis.get(RedisService.LEADER_KEY);
      console.log(`[LEADER] Currently held by: ${leader}`);
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
    console.log(`[LEADER] TTL renewed by ${this.instanceId}`);
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
