import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { CoastersService } from '../../application';
import { CreateCoasterDto } from './dto';

@Controller('coasters')
export class CoastersController {
  constructor(private readonly coasterService: CoastersService) {}
  /**
   * Task 1. Rejestracja nowej kolejki górskiej:
   *
   * 1. Endpoint: POST /api/coasters
   * 2. Dodaje nową kolejkę górską do systemu, uwzględniając dane takie jak liczba personelu, liczba klientów dziennie i długość trasy (w metrach), godziny operacyjne. Dane te są podawane ręcznie i same się nie zmieniają
   * 3. Przykład danych: { liczba_personelu: 16, liczba_klientow:60000, dl_trasy: 1800, godziny_od: "8:00", godziny_do:"16:00" }
   */
  @Post()
  async createCoasters(@Body() body: CreateCoasterDto) {
    return this.coasterService.create(body);
  }
  /**
   * Task 2. Rejestracja nowego wagonu:
   *
   * 1. Endpoint: POST /api/coasters/:coasterId/wagons
   * 2. Dodaje nowy wagon do określonej kolejki górskiej, z danymi dotyczącymi liczby miejsc i prędkości (m/s)
   * 3. Przykład danych: { ilosc_miejsc: 32, predkosc_wagonu: 1.2 }
   */
  @Post(':coasterId/wagons')
  createWagon(
    @Param('coasterId') coasterId: string,
    @Param('wagonId') wagonId: string,
  ) {
    return `This action create for coaster ${coasterId} wagons ${wagonId}`;
  }
  /**
   * Task 3. Usunięcie wagonu:
   *
   * 1. Endpoint: DELETE /api/coasters/:coasterId/wagons/:wagonId
   * 2. Usuwa wybrany wagon z danej kolejki górskiej
   */
  @Delete(':coasterId/wagons/:wagonId')
  removeWagon(
    @Param('coasterId') coasterId: string,
    @Param('wagonId') wagonId: string,
  ) {
    return `This action remove from coaster ${coasterId} wagons ${wagonId}`;
  }
  /**
   * Task 4. Zmiana kolejki górskiej:
   *
   * 1. Endpoint: PUT /api/coasters/:coasterId
   * 2. Aktualizuje dane istniejącej kolejki górskiej, takie jak liczba personelu, liczba klientów dziennie i godziny operacyjne. Długość trasy się nie zmienia
   */
  @Put(':coasterId')
  updateCoaster(@Param('coasterId') coasterId: string): string {
    return `This action update coaster ${coasterId}`;
  }
}
