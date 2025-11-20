import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateStaffDto {
  @IsUUID()
  userId: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  weeklyOffDays: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  serviceIds: string[];
}
