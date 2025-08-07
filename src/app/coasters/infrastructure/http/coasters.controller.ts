import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateCoasterDTO, AddWagonDTO, UpdateCoasterDTO } from '../dto';
import {
  AddWagonToCoasterUseCase,
  CreateCoasterUseCase,
  RemoveWagonUseCase,
  UpdateCoasterUseCase,
} from '../../application/use-cases';
import { LeaderOnlyGuard } from '@/guard/leader-only.guard';

@Controller('coasters')
@UseGuards(LeaderOnlyGuard)
export class CoastersController {
  constructor(
    private readonly createCoasterUseCase: CreateCoasterUseCase,
    private readonly addWagonUseCase: AddWagonToCoasterUseCase,
    private readonly removeWagonUseCase: RemoveWagonUseCase,
    private readonly updateCoasterUseCase: UpdateCoasterUseCase,
  ) {}
  /**
   * Task 1. Rejestracja nowej kolejki górskiej:
   *
   * 1. Endpoint: POST /api/coasters
   * 2. Dodaje nową kolejkę górską do systemu, uwzględniając dane takie jak liczba personelu, liczba klientów dziennie i długość trasy (w metrach), godziny operacyjne. Dane te są podawane ręcznie i same się nie zmieniają
   * 3. Przykład danych: { liczba_personelu: 16, liczba_klientow:60000, dl_trasy: 1800, godziny_od: "8:00", godziny_do:"16:00" }
   */
  @Post()
  async createCoasters(@Body() body: CreateCoasterDTO) {
    return this.createCoasterUseCase.execute(body);
  }
  /**
   * Task 2. Rejestracja nowego wagonu:
   *
   * 1. Endpoint: POST /api/coasters/:coasterId/wagons
   * 2. Dodaje nowy wagon do określonej kolejki górskiej, z danymi dotyczącymi liczby miejsc i prędkości (m/s)
   * 3. Przykład danych: { ilosc_miejsc: 32, predkosc_wagonu: 1.2 }
   */
  @Post(':coasterId/wagons')
  createWagon(@Param('coasterId', ParseUUIDPipe) coasterId: string, @Body() body: AddWagonDTO) {
    return this.addWagonUseCase.execute(coasterId, body);
  }
  /**
   * Task 3. Usunięcie wagonu:
   *
   * 1. Endpoint: DELETE /api/coasters/:coasterId/wagons/:wagonId
   * 2. Usuwa wybrany wagon z danej kolejki górskiej
   */
  @Delete(':coasterId/wagons/:wagonId')
  removeWagon(
    @Param('coasterId', ParseUUIDPipe) coasterId: string,
    @Param('wagonId', ParseUUIDPipe) wagonId: string,
  ) {
    return this.removeWagonUseCase.execute(coasterId, wagonId);
  }
  /**
   * Task 4. Zmiana kolejki górskiej:
   *
   * 1. Endpoint: PUT /api/coasters/:coasterId
   * 2. Aktualizuje dane istniejącej kolejki górskiej, takie jak liczba personelu, liczba klientów dziennie i godziny operacyjne. Długość trasy się nie zmienia
   */
  @Put(':coasterId')
  updateCoaster(
    @Param('coasterId', ParseUUIDPipe) coasterId: string,
    @Body() body: UpdateCoasterDTO,
  ) {
    return this.updateCoasterUseCase.execute(coasterId, body);
  }
}
