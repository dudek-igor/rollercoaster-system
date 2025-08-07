import { CanActivate, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/databases/redis/redis.service';

@Injectable()
export class LeaderOnlyGuard implements CanActivate {
  private readonly logger = new Logger(LeaderOnlyGuard.name);

  constructor(private readonly redisService: RedisService) {}

  canActivate() {
    try {
      const isLeader = this.redisService.getIsLeader();
      return isLeader;
    } catch (err) {
      // Redis is unavailable, so we pass the request
      this.logger.warn('[GUARD] Redis unavailable. Allowing request as fallback.');
      return true;
    }
  }
}
