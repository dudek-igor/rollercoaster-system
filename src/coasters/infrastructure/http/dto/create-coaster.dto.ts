import {
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsString,
  Min,
  Matches,
} from 'class-validator';

export default class CreateCoasterDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  staffCount: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  customersCount: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  routeLength: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'openingHours must be in HH:MM format (00:00 - 23:59)',
  })
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'closingHours must be in HH:MM format (00:00 - 23:59)',
  })
  closingHours: string;
}
