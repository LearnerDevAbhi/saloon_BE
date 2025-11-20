import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { BookingStatus } from '../../../common/enums/booking-status.enum';

@Entity('bookings')
@Index(['bookingDate', 'staff'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
  customer: User;

  @ManyToOne(() => ServiceEntity, (service) => service.bookings, { eager: true })
  service: ServiceEntity;

  @ManyToOne(() => Staff, (staff) => staff.bookings, { eager: true })
  staff: Staff;

  @Column({ type: 'date' })
  bookingDate: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
