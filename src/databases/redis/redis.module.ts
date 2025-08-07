import { Module, Global } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';

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
  providers: [RedisProvider, RedisService],
  exports: [RedisProvider, RedisService],
})
export class RedisModule {}
