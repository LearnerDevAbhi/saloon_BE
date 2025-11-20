import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Staff } from '../staff/entities/staff.entity';
import { DashboardOverview, StaffUtilizationStat } from './interfaces/dashboard-overview.interface';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async getOverview(): Promise<DashboardOverview> {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const [todayAppointments, upcomingAppointments, totalRevenue, staffUtilization] = await Promise.all([
      this.bookingsRepository.find({
        where: { bookingDate: today },
        order: { startTime: 'ASC' },
      }),
      this.bookingsRepository
        .createQueryBuilder('booking')
        .where('booking.bookingDate > :today', { today })
        .orWhere('booking.bookingDate = :today AND booking.startTime > :currentTime', { today, currentTime })
        .orderBy('booking.bookingDate', 'ASC')
        .addOrderBy('booking.startTime', 'ASC')
        .limit(20)
        .getMany(),
      this.calculateTotalRevenue(),
      this.calculateStaffUtilization(today),
    ]);

    return {
      todayAppointments,
      upcomingAppointments,
      totalRevenue,
      staffUtilization,
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const result = await this.bookingsRepository
      .createQueryBuilder('booking')
      .select('COALESCE(SUM(booking.amount), 0)', 'total')
      .where('booking.status = :status', { status: BookingStatus.COMPLETED })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  private async calculateStaffUtilization(today: string): Promise<StaffUtilizationStat[]> {
    const [staffMembers, stats] = await Promise.all([
      this.staffRepository.find({ select: ['id', 'name'] }),
      this.bookingsRepository
        .createQueryBuilder('booking')
        .innerJoin('booking.staff', 'staff')
        .select('staff.id', 'staffId')
        .addSelect('COUNT(booking.id)', 'totalAppointments')
        .addSelect(
          `SUM(CASE WHEN booking.status = '${BookingStatus.CONFIRMED}' THEN 1 ELSE 0 END)`,
          'confirmedAppointments',
        )
        .addSelect(`SUM(CASE WHEN booking.bookingDate = :today THEN 1 ELSE 0 END)`, 'todayAppointments')
        .groupBy('staff.id')
        .setParameters({ today })
        .getRawMany<{
          staffId: string;
          totalAppointments: string;
          confirmedAppointments: string;
          todayAppointments: string;
        }>(),
    ]);

    const statMap = new Map(
      stats.map((stat) => [
        stat.staffId,
        {
          totalAppointments: Number(stat.totalAppointments ?? 0),
          confirmedAppointments: Number(stat.confirmedAppointments ?? 0),
          todayAppointments: Number(stat.todayAppointments ?? 0),
        },
      ]),
    );

    return staffMembers.map<StaffUtilizationStat>((staff) => {
      const stat = statMap.get(staff.id);
      return {
        staffId: staff.id,
        staffName: staff.name,
        totalAppointments: stat?.totalAppointments ?? 0,
        confirmedAppointments: stat?.confirmedAppointments ?? 0,
        todayAppointments: stat?.todayAppointments ?? 0,
      };
    });
  }
}

