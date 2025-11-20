import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID, Matches, IsDateString, IsNumber, IsPositive } from 'class-validator';
import { BookingStatus } from '../../../common/enums/booking-status.enum';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  staffId: string;

  @IsDateString()
  bookingDate: string;

  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;
}
