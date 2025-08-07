import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '@/constants';
import { Provider } from '@nestjs/common';

export const createRedisClient = async (
  configService: ConfigService<EnvironmentVariables, true>,
) => {
  const host = configService.get(REDIS_HOST, { infer: true });
  const port = configService.get(REDIS_PORT, { infer: true });
  const password = configService.get(REDIS_PASSWORD, { infer: true });

  const client = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: 1,
    // Reconnect every 2 seconds indefinitely
    retryStrategy: () => {
      return 2000;
    },
  });

  return client;
};

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: createRedisClient,
};
