import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config';
import { NODE_ENV } from '@/constants';
import * as winston from 'winston';
import * as path from 'path';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => {
        const environment = config.get(NODE_ENV, { infer: true });
        const isDev = environment === 'development';
        const logDir = `data/${environment}/logs`;

        return {
          level: isDev ? 'debug' : 'warn',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json(),
          ),
          transports: [
            new winston.transports.Console({
              level: isDev ? 'debug' : 'warn',
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp, context }) => {
                  return `[${timestamp}] ${level} ${context ?? ''} - ${message}`;
                }),
              ),
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'error.log'),
              level: 'error',
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'warn.log'),
              level: 'warn',
            }),
            new winston.transports.File({
              filename: path.join(logDir, 'info.log'),
              level: 'info',
            }),
          ],
        };
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
