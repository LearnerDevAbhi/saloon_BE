import { IsArray, IsDateString, IsOptional, Matches } from 'class-validator';

export class UpdateSalonConfigDto {
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  openingTime?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/)
  closingTime?: string;

  @IsOptional()
  @IsArray()
  weeklyOffDays?: string[];

  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  holidayDates?: string[];
}
