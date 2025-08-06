import { IsInt, IsPositive, Min, IsString, Matches } from 'class-validator';

export class UpdateCoasterDTO {
  @IsInt()
  @IsPositive()
  liczba_personelu: number;

  @IsInt()
  @Min(0)
  liczba_klientow: number;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'godziny_od muszą być formatu HH:MM (00:00 - 23:59)',
  })
  godziny_od: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'godziny_do muszą być formatu HH:MM (00:00 - 23:59)',
  })
  godziny_do: string;
}
