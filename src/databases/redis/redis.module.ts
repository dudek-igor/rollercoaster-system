import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config';
import {
  REDIS_CLIENT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from '@/constants';
/**
 * Zadanie Redis.
 *
 * Zakładamy, że Redis jest uruchomiony na zewnętrznej maszynie, do której dostęp mamy poprzez adres IP i port.
 * W praktyce oznacza to, że w konfiguracji projektu nie tworzymy kontenera Redis w Docker Compose, ale zamiast tego aplikacja powinna połączyć się z Redisem uruchomionym na tej samej maszynie, używając zdefiniowanego adresu IP i portu
 *
 * [Zamockowałem Redis odpalając go przez docker i wystawiając port.]
 * [ docker run --name redis -e ALLOW_EMPTY_PASSWORD=yes -p 6379:6379 bitnami/redis:latest ]
 *
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (
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
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
