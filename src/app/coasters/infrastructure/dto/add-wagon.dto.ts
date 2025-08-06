import { IsInt, IsPositive, IsNotEmpty, IsNumber } from 'class-validator';

export class AddWagonDTO {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  ilosc_miejsc: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  predkosc_wagonu: number;
}
