import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import { ServiceEntity } from '../services/entities/service.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const user = await this.usersService.findById(createStaffDto.userId);
    if (user.role !== UserRole.STAFF && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('User must have staff role');
    }

    this.ensureValidWorkingWindow(createStaffDto.startTime, createStaffDto.endTime);
    const services = await this.fetchServices(createStaffDto.serviceIds);

    const staff = this.staffRepository.create({
      user,
      name: createStaffDto.name ?? user.name,
      email: createStaffDto.email ?? user.email,
      phone: createStaffDto.phone ?? user.phone,
      role: createStaffDto.role,
      startTime: createStaffDto.startTime,
      endTime: createStaffDto.endTime,
      weeklyOffDays: createStaffDto.weeklyOffDays,
      services,
    });
    return this.staffRepository.save(staff);
  }

  findAll() {
    return this.staffRepository.find({ relations: ['services', 'user'] });
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['services', 'user'] });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.findOne(id);

    if (updateStaffDto.serviceIds) {
      staff.services = await this.fetchServices(updateStaffDto.serviceIds);
    }

    if (updateStaffDto.userId && updateStaffDto.userId !== staff.user.id) {
      const user = await this.usersService.findById(updateStaffDto.userId);
      if (user.role !== UserRole.STAFF && user.role !== UserRole.ADMIN) {
        throw new BadRequestException('User must have staff role');
      }
      staff.user = user;
    }

    const nextStart = updateStaffDto.startTime ?? staff.startTime;
    const nextEnd = updateStaffDto.endTime ?? staff.endTime;
    this.ensureValidWorkingWindow(nextStart, nextEnd);

    Object.assign(staff, {
      name: updateStaffDto.name ?? staff.name,
      email: updateStaffDto.email ?? staff.email,
      phone: updateStaffDto.phone ?? staff.phone,
      role: updateStaffDto.role ?? staff.role,
      startTime: nextStart,
      endTime: nextEnd,
      weeklyOffDays: updateStaffDto.weeklyOffDays ?? staff.weeklyOffDays,
    });

    return this.staffRepository.save(staff);
  }

  async remove(id: string) {
    const staff = await this.findOne(id);
    await this.staffRepository.softRemove(staff);
    return { success: true };
  }

  private async fetchServices(serviceIds: string[]) {
    const services = await this.serviceRepository.find({ where: { id: In(serviceIds) } });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more services not found');
    }
    return services;
  }

  private ensureValidWorkingWindow(startTime: string, endTime: string) {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      throw new BadRequestException('Start time must be earlier than end time');
    }
  }

  private timeToMinutes(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
