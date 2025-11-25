import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  url: configService.get<string>('database.url'),
  autoLoadEntities: true,
  synchronize: false,
  logging: configService.get<boolean>('database.logging') ?? true,
  ssl: configService.get<boolean>('database.ssl') ?? false
});
