import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ comment: 'Displayed role e.g. Hair Stylist' })
  role: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToMany(() => ServiceEntity, (service) => service.staff, { eager: true })
  @JoinTable({ name: 'staff_services' })
  services: ServiceEntity[];

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column('text', { array: true, default: '{}' })
  weeklyOffDays: string[];

  @OneToMany(() => Booking, (booking) => booking.staff)
  bookings: Booking[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
