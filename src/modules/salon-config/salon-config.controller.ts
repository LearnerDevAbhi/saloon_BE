import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SalonConfigService } from './salon-config.service';
import { UpdateSalonConfigDto } from './dto/update-salon-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@ApiTags('salon-config')
@Controller('config')
export class SalonConfigController {
  constructor(private readonly salonConfigService: SalonConfigService) {}

  @Get()
  getConfig() {
    return this.salonConfigService.getConfig();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch()
  updateConfig(@Body() updateSalonConfigDto: UpdateSalonConfigDto) {
    return this.salonConfigService.updateConfig(updateSalonConfigDto);
  }
}

