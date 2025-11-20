import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UsersService } from '../users/users.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { BookingStatus, ACTIVE_BOOKING_STATUSES } from '../../common/enums/booking-status.enum';
import { UserRole } from '../../common/enums/role.enum';
import { SalonConfigService } from '../salon-config/salon-config.service';
import { SalonConfig } from '../salon-config/entities/salon-config.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly usersService: UsersService,
    private readonly salonConfigService: SalonConfigService,
  ) {}

  async create(customerId: string, createBookingDto: CreateBookingDto) {
    const [customer, service, staff, config] = await Promise.all([
      this.usersService.findById(customerId),
      this.servicesRepository.findOne({ where: { id: createBookingDto.serviceId } }),
      this.staffRepository.findOne({ where: { id: createBookingDto.staffId }, relations: ['services'] }),
      this.salonConfigService.getConfig(),
    ]);

    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const canPerform = staff.services.some((svc) => svc.id === service.id);
    if (!canPerform) {
      throw new BadRequestException('Selected staff member cannot perform this service');
    }

    const startMinutes = this.timeToMinutes(createBookingDto.startTime);
    const endMinutes = startMinutes + service.duration;
    const startTime = createBookingDto.startTime;
    const endTime = this.minutesToTime(endMinutes);

    this.enforceWorkingHours(startMinutes, endMinutes, staff, config);
    this.enforceOffDays(createBookingDto.bookingDate, staff, config);
    await this.ensureNoConflicts(staff.id, createBookingDto.bookingDate, startTime, endTime);

    const booking = this.bookingsRepository.create({
      customer,
      service,
      staff,
      bookingDate: createBookingDto.bookingDate,
      startTime,
      endTime,
      status: createBookingDto.status ?? BookingStatus.PENDING,
      amount: createBookingDto.amount ?? Number(service.price),
    });

    return this.bookingsRepository.save(booking);
  }

  async findAll(requestUser: AuthenticatedUser) {
    if (requestUser.role === UserRole.ADMIN) {
      return this.bookingsRepository.find({ order: { bookingDate: 'ASC', startTime: 'ASC' } });
    }

    if (requestUser.role === UserRole.STAFF) {
      const staff = await this.staffRepository.findOne({
        where: { user: { id: requestUser.userId } },
        relations: ['user'],
      });
      if (!staff) {
        return [];
      }
      return this.bookingsRepository.find({ where: { staff: { id: staff.id } } });
    }

    return this.bookingsRepository.find({ where: { customer: { id: requestUser.userId } } });
  }

  async findOneForUser(id: string, requestUser: AuthenticatedUser) {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (requestUser.role === UserRole.ADMIN) {
      return booking;
    }

    if (requestUser.role === UserRole.STAFF) {
      const staff = await this.staffRepository.findOne({
        where: { user: { id: requestUser.userId } },
        relations: ['user'],
      });
      if (staff && booking.staff.id === staff.id) {
        return booking;
      }
      throw new ForbiddenException();
    }

    if (booking.customer.id !== requestUser.userId) {
      throw new ForbiddenException();
    }
    return booking;
  }

  async updateStatus(id: string, updateBookingStatusDto: UpdateBookingStatusDto, requestUser: AuthenticatedUser) {
    if (requestUser.role === UserRole.CUSTOMER) {
      throw new ForbiddenException('Customers cannot update booking status');
    }

    const booking = await this.findOneForUser(id, requestUser);
    booking.status = updateBookingStatusDto.status;
    return this.bookingsRepository.save(booking);
  }

  async remove(id: string, requestUser: AuthenticatedUser) {
    const booking = await this.findOneForUser(id, requestUser);

    if (requestUser.role === UserRole.CUSTOMER && booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Customers can only cancel pending bookings');
    }

    await this.bookingsRepository.softRemove(booking);
    return { success: true };
  }

  private async ensureNoConflicts(staffId: string, bookingDate: string, startTime: string, endTime: string) {
    const conflict = await this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.staffId = :staffId', { staffId })
      .andWhere('booking.bookingDate = :bookingDate', { bookingDate })
      .andWhere('booking.status IN (:...statuses)', { statuses: ACTIVE_BOOKING_STATUSES })
      .andWhere('booking.startTime < :endTime AND booking.endTime > :startTime', { startTime, endTime })
      .getOne();

    if (conflict) {
      throw new BadRequestException('Staff member already has a booking for this time');
    }
  }

  private enforceWorkingHours(startMinutes: number, endMinutes: number, staff: Staff, config: SalonConfig) {
    const staffStart = this.timeToMinutes(staff.startTime);
    const staffEnd = this.timeToMinutes(staff.endTime);

    if (startMinutes < staffStart || endMinutes > staffEnd) {
      throw new BadRequestException('Booking outside staff working hours');
    }

    if (config.openingTime && config.closingTime) {
      const salonStart = this.timeToMinutes(config.openingTime);
      const salonEnd = this.timeToMinutes(config.closingTime);
      if (startMinutes < salonStart || endMinutes > salonEnd) {
        throw new BadRequestException('Booking outside salon operating hours');
      }
    }
  }

  private enforceOffDays(bookingDate: string, staff: Staff, config: SalonConfig) {
    const dayName = this.getDayName(bookingDate);
    const staffDays = staff.weeklyOffDays?.map((day) => day.toLowerCase()) ?? [];
    if (staffDays.includes(dayName)) {
      throw new BadRequestException('Cannot book on staff weekly off day');
    }

    const salonOffDays = config.weeklyOffDays?.map((day: string) => day.toLowerCase()) ?? [];
    if (salonOffDays.includes(dayName)) {
      throw new BadRequestException('Salon is closed on the selected day');
    }

    const holidayDates = config.holidayDates?.map((date: Date | string) => this.normalizeDate(date)) ?? [];
    if (holidayDates.includes(bookingDate)) {
      throw new BadRequestException('Salon is closed on the selected date');
    }
  }

  private getDayName(date: string) {
    const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const parsed = new Date(date);
    return week[parsed.getUTCDay()];
  }

  private normalizeDate(date: Date | string) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date.split('T')[0];
  }

  private timeToMinutes(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(value: number) {
    const hours = Math.floor(value / 60) % 24;
    const minutes = value % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
