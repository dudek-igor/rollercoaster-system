# 🎢 System Kolejek Górskich

System zarządzania kolejkami górskimi oraz wagonami z obsługą środowiska rozproszonego i synchronizacją danych w czasie rzeczywistym.

---

## Stack technologiczny

- **NestJS (TypeScript)** – główny framework backendowy
- **Redis / Redis Stream** – synchronizacja danych między węzłami
- **Docker & Docker Compose** – uruchamianie środowisk dev/prod
- **JSON** – trwałe przechowywanie danych
- **Winston** – system logowania

---

## Architektura

Została zastosowana architektura heksagonalna oparta o Ports and Adapters

### Główne elementy architektury

1. Core (Domena)
   - Ścieżka: src/app/coasters/core
   - To serce systemu – nie wie nic o technologiach zewnętrznych.
   - Zawiera:
     - Entities – obiekty domenowe (coaster.entity.ts, wagon.entity.ts)
     - Ports – kontrakty (interfejsy), które muszą zaimplementować adaptery:
       - repository: np. coaster-repository.port.ts
       - event-bus: np. coaster-publisher.port.ts, coaster-subscriber.port.ts

Zasada - Core zawiera tylko logikę biznesową i zależy tylko od portów (interfejsów), nie od implementacji.

2. Infrastructure
   - Ścieżka: src/app/coasters/infrastructure
   - Tutaj znajdują się adaptery, które implementują porty.
   - Przykłady:
     - Persistence: coaster-file-storage.adapter.ts
     - Messaging (Redis):
       - coaster-redis-publisher.adapter.ts
       - coaster-redis-subscriber.adapter.ts
   - Zawiera też:
     - dto/ – dane wejściowe/wyjściowe z API
     - http/coasters.controller.ts – warstwa HTTP (np. REST)
     - monitoring/ – logika monitorująca (np. health-check, metryki)

Zasada - Adaptery realizują konkretne technologie, ale są podłączane tylko przez porty (interfejsy).

3. Application
   - Ścieżka: src/app/coasters/application
   - Łączy encje, porty i inne elementy logiki.
   - Zawiera use-case’y, czyli przypadki użycia systemu, przykłady:
     - create-coaster.use-case.ts
     - add-wagon-to-coaster.use-case.ts
     - remove-wagon.use-case.ts

Zasada - Use-case'y definiują co system robi – ale nie jak to dokładnie robią technologie zewnętrzne.

### Schemat działania

```bash
┌──────────────────────┐
│  infrastructure/http │◀───── użytkownik (np. REST API)
└────────▲─────────────┘
         │
         │ wywołuje
         ▼
┌──────────────────────┐
│   application/use-cases  │
└────────▲─────────────┘
         │ używa
         ▼
┌──────────────────────┐
│     core/entities     │
│     core/ports        │◀───── zaimplementowane przez
└──────────────────────┘        infrastructure/adapters
```

---

## Uruchamianie projektu

### 1. Wymagania

- Docker + Docker Compose
- Zewnętrzny Redis (uruchomiony poza Dockerem na tej samej maszynie)
- Uwaga - brak połączenia z Redis nie blokuje działania programu.

### 2. Klonowanie repozytorium

```bash
git clone https://github.com/dudek-igor/rollercoaster-system
cd rollercoaster-system
```

### 3. Mock-ujemy zewnętrzną instancję Redis poza Dockerem Compose na tej samej maszynie

```bash
docker network create --driver bridge --internal internal-net

docker run -d \
 --name redis-internal \
 --network internal-net \
 -e ALLOW_EMPTY_PASSWORD=yes \
 bitnami/redis:latest
```

### 4. Budujemy Docker Compose

```bash
docker compose up --build
```

### 5. "Sytem" Docker Compose posaida dwa tryby działania

1. Developerska
   - hermetycznie zamknięta.
   - Dostępna poprzez sieć (network) docker - `internal-net`.
   - Nasłuchuje na porcie 3050.
   - Konsola pokazuje log, warn, error.
   - Logi zapisywane do:
     - `data/development/info.log`
     - `data/development/warn.log`
     - `data/development/error.log`

2. Produkcyjna
   - ma dostęp do sieci `internal-net`
   - nasłuchuje na porcie 3051.
   - aplikacja "wystawiona na świat" na porcie 3051.
   - Konsola pokazuje tylko warn i error
   - Logi zapisywane do:
     - `data/producation/info.log`
     - `data/producation/warn.log`
     - `data/producation/error.log`

Internal Network

```yaml
networks:
  public:
  internal:
    external: true
    name: internal-net
```

Każdwa wersja posiada swój wolumen danych. Dane są odseparowane od siebie. Osobna przestrzeń danych.

```yaml
volumes:
  prod-data:
  dev-data:
```

---

## Endpointy API

1. Rejestracja nowej kolejki górskiej - `POST /api/coasters`
2. Rejestracja nowego wagonu - `POST /api/coasters/:coasterId/wagons`
3. Usunięcie wagonu - `DELETE /api/coasters/:coasterId/wagons/:wagonId`
4. Zmiana kolejki górskiej - `PUT /api/coasters/:coasterId`

---

## Logika

### Kolejki i wagony

- Każda kolejka działa w określonych godzinach (godziny_od, godziny_do)
- Wagon musi ukończyć trasę i wrócić przed końcem działania
- Po przejechaniu trasy wagon ma 5 minut przerwy
- Obsługa:
  - 1 pracownik na kolejkę
  - +2 pracowników na każdy wagon

### Klienci i przepustowość

- System porównuje dzienną przepustowość z zaplanowaną liczbą klientów
- Informuje, gdy:
  - brakuje wagonów/personelu
  - 2x nadmiar mocy

### Personel

- System oblicza i raportuje:
  - minimalną wymaganą liczbę osób
  - braki
  - nadmiary

---

## Monitorowanie i statystyki

Dane wyświetlane są w konsoli i odświeżane co 1s

```bash
[Godzina: 20:24]

[Coaster 0194]
1. Godziny działania: 08:00 - 20:00
2. Liczba wagonów: 0/0
3. Dostępny personel:: 10/1
4. Klienci dziennie: 0
5. Status: BRAK_WAGONÓW


[Coaster 0913]
1. Godziny działania: 08:00 - 20:00
2. Liczba wagonów: 2/1
3. Dostępny personel:: 7/5
4. Klienci dziennie: 89600
5. Status: POZA_GODZINAMI_OPERACYJNYMI, NADMIAR_PERSONELU, NADMIAR_WAGONÓW


[Coaster 1DC9]
1. Godziny działania: 08:00 - 20:00
2. Liczba wagonów: 0/0
3. Dostępny personel:: 10/1
4. Klienci dziennie: 0
5. Status: BRAK_WAGONÓW
```

---

## System rozproszony

- Każda kolejka może działać samodzielnie (offline)
- Jeśli więcej kolejek jest w sieci:
  - jedna zostaje węzłem centralnym
  - zarządza resztą

### Synchronizacja danych

- Działa **asynchronicznie**
- Zmiany lokalne są natychmiastowe
- Replikacja do pozostałych w tle

### Przechowywanie danych

- Dane zapisywane w plikach .json
- Osobna struktura dla dev i prod

### Redis

- Wykorzystujemy **Redis Streams**
- Nie jest uruchamiany w kontenerze
- Redis działa na tej samej maszynie, poza Dockerem
- Obsługuje synchronizację i komunikację między węzłami

---
