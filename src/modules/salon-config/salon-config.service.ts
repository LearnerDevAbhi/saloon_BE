import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalonConfig } from './entities/salon-config.entity';
import { UpdateSalonConfigDto } from './dto/update-salon-config.dto';

@Injectable()
export class SalonConfigService {
  constructor(
    @InjectRepository(SalonConfig)
    private readonly salonConfigRepository: Repository<SalonConfig>,
  ) {}

  async getConfig(): Promise<SalonConfig> {
    let config = await this.salonConfigRepository.findOne({
      order: { createdAt: 'ASC' },
    });

    if (!config) {
      config = this.salonConfigRepository.create();
      config = await this.salonConfigRepository.save(config);
    }

    return config;
  }

  async updateConfig(updateConfigDto: UpdateSalonConfigDto): Promise<SalonConfig> {
    const config = await this.getConfig();
    Object.assign(config, updateConfigDto);
    return this.salonConfigRepository.save(config);
  }
}

