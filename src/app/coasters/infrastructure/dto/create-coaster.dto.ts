import { IsInt, IsPositive, IsNotEmpty, IsString, Min, Matches } from 'class-validator';

export class CreateCoasterDTO {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  liczba_personelu: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  liczba_klientow: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  dl_trasy: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'godziny_od muszą być formatu HH:MM (00:00 - 23:59)',
  })
  godziny_od: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'godziny_do muszą być formatu HH:MM (00:00 - 23:59)',
  })
  godziny_do: string;
}
