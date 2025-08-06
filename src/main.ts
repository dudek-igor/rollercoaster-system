import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config';
import { PORT } from '@/constants';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  /** Adjust winston logger */
  app.useLogger(app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER));
  /** Add global prefix */
  app.setGlobalPrefix('api');
  /** Adjsut validation pipe  */
  app.useGlobalPipes(new ValidationPipe());
  /** Setup Port */
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const port = configService.get(PORT, { infer: true });
  await app.listen(port);
}
bootstrap();
