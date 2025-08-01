import {
  NODE_ENV,
  PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from '@/constants';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}
/**
 * For a larger project I would add config to namespaces (registerAs) or per module (via forFeature)
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  [NODE_ENV]: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  [PORT]: number;

  @IsString()
  [REDIS_HOST]: string = 'localhost';

  @IsNumber()
  @Min(0)
  @Max(65535)
  [REDIS_PORT]: number = 6379;

  @IsString()
  [REDIS_PASSWORD]: string = '';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
