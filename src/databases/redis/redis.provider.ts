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
    // Reconnect every 2 seconds indefinitely
    retryStrategy: (times) => {
      console.log(`Reconnect attempt: ${times}`);
      return 2000;
    },
    maxRetriesPerRequest: null,
  });

  await client.ping();

  return client;
};

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: createRedisClient,
};
