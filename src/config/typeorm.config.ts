import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.name'),
  autoLoadEntities: true,
  synchronize: false,
  logging: configService.get<boolean>('database.logging'),
  ssl: configService.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
});
