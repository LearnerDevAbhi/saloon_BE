import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalonConfigController } from './salon-config.controller';
import { SalonConfigService } from './salon-config.service';
import { SalonConfig } from './entities/salon-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalonConfig])],
  controllers: [SalonConfigController],
  providers: [SalonConfigService],
  exports: [SalonConfigService],
})
export class SalonConfigModule {}

