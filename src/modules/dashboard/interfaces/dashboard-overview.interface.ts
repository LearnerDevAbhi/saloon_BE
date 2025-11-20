import { Booking } from '../../bookings/entities/booking.entity';

export interface StaffUtilizationStat {
  staffId: string;
  staffName: string;
  totalAppointments: number;
  confirmedAppointments: number;
  todayAppointments: number;
}

export interface DashboardOverview {
  todayAppointments: Booking[];
  upcomingAppointments: Booking[];
  totalRevenue: number;
  staffUtilization: StaffUtilizationStat[];
}

