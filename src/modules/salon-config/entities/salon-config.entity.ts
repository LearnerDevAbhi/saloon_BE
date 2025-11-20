import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('salon_config')
export class SalonConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time', default: '09:00' })
  openingTime: string;

  @Column({ type: 'time', default: '21:00' })
  closingTime: string;

  @Column('text', { array: true, default: '{}' })
  weeklyOffDays: string[];

  @Column('date', { array: true, default: '{}' })
  holidayDates: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
