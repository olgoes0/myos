# LIFE OS – v6: zupy w talerzach, 417 dań, 7 motywów kolorów

## Co się zmieniło

### 🍲 Wpisywanie w talerzach, szklankach, miskach
Możesz pisać po ludzku, a apka sama przelicza na gramy:

| Wpisujesz | Apka liczy |
|---|---|
| `zupa z buraków 2 talerze` | 2 × 300 g |
| `2 talerze zupy pomidorowej` | 2 × 300 g |
| `1 miska owsianki` | 300 g |
| `1 szklanka mleka` | 250 g |
| `300 ml kefiru` | 300 g |
| `3 kawałki pizzy margherita` | 3 × 110 g |
| `2 kromki chleba` | 2 × 30 g |
| `1 łyżka oliwy` | 15 g |
| `2 jajka` | 2 × 60 g |
| `150 g kurczaka` | 150 g |

Liczba może stać przed nazwą albo po niej. Rozpoznawane są odmiany (talerz, talerze, talerzy; miska, miski; szklanka, kubek; kawałek, porcja itd.).

### 🍽️ Baza: 417 pozycji
- **Zupy (ok. 45)**: barszcz czerwony i biały, żurek, rosół z kluskami, pomidorowa, ogórkowa, krem z dyni, brokułów, pomidorów, pieczarek, grochowa, fasolowa, gulaszowa, kapuśniak, szczawiowa, chłodnik, tom yum, miso, ramen, pho i inne. Każda zupa ma wagę talerza (300 g).
- **Dania polskie**: schabowy, kotlet mielony, pierogi (ruskie, z mięsem, z kapustą, z serem, z owocami), naleśniki, placki, kopytka, kluski śląskie, gołąbki, bigos, gulasz, golonka, kasze, surówki, kiszonki.
- **Pizza i fast food**: kilka rodzajów pizzy (kawałek 110 g), pizza mrożona sklepowa, „ćwiartka” pizzy ze sklepu (150 g), ciasto na pizzę (gotowe i domowe), kebab, burger, nuggetsy, hot dog, frytki, zapiekanka, burrito, tacos, nachos, kanapki, croissant, sushi.
- **Azjatyckie i włoskie**: pad thai, udon, sajgonki, dim sum, teriyaki, risotto, lasagne, carbonara, gnocchi.
- **Mięsa, wędliny, ryby, nabiał, warzywa, owoce, desery, napoje, sosy**.

Wartości są orientacyjne (na 100 g, z ogólnych tabel). Przy konkretnych produktach sprawdź etykietę albo dodaj własną pozycję w DIETA › Produkty.

Stare bazy dostają nowe pozycje automatycznie. Twoje własne produkty zostają bez zmian.

### 🎨 Motywy kolorów
W **USTAWIENIA › Motyw kolorów** wybierasz jeden z 7 motywów:
- **Jasny ciepły** (domyślny, jasny)
- **Pustynia (terakota)** – jasny, ciepły beż z terakotowym akcentem
- **Nocny granat** – ciemny, niebieskawy
- **Ocean (morski)** – ciemny, morski
- **Las (zieleń)** – ciemny, zielony
- **Wino (bordo)** – ciemny, wytonowany na bordo
- **Śliwka (fiolet)** – ciemny, fioletowy

Zmiana jest natychmiastowa.

### 🖌️ Własne kolory
Pod motywami masz dwa pola:
- **Kolor akcentu** – przyciski, zakładki, wykresy, licznik,
- **Kolor tła** – reszta kolorów (karty, tekst, pola) dopasowuje się sama. Jasne tło daje ciemny tekst, ciemne tło daje jasny.

Przycisk **„Przywróć kolory motywu”** kasuje Twoje ustawienia.

## Co się NIE zmieniło
- Dane są nadal lokalne (w tej przeglądarce). Eksport i import JSON działają jak wcześniej. Motyw i kolory są zapisane w kopii zapasowej.
- Trening dowolny, woda w litrach, kalkulator i reszta zakładek działają jak w v5.

## Pliki
- `produkty.js` – baza, 417 pozycji (dopisane zupy i dania).
- `app.js` – parser w talerzach, motywy i własne kolory (sekcja „MOTYW (kolory)”).
- `index.html` – nowy CSS oparty na zmiennych kolorów.
- `sw.js` – wersja pamięci `lifeos-v7`.
- `testy/test-v4.js` – test logiki (zaktualizowany).

## Jak przetestować

### A. Test automatyczny
1. W folderze `lifeos` wpisz: `node testy/test-v4.js`
2. Na końcu powinno być **ALL PASS**.

### B. W przeglądarce
1. **Talerze**: DIETA › Dziś › Obiad. Wpisz `zupa z buraków 2 talerze` i kliknij „Oblicz i dodaj”. Powinno być **600 g**, ok. 210 kcal.
2. **Szklanka**: wpisz `1 szklanka mleka`. Powinno być 250 g.
3. **Baza**: DIETA › Produkty. Wyszukaj `zupa`, `pierogi`, `pizza`, `kebab`.
4. **Motywy**: USTAWIENIA › Motyw kolorów. Kliknij każdy motyw i sprawdź, czy wszystkie ekrany dobrze wyglądają (szczególnie Dieta, Ciało, Ustawienia).
5. **Własne kolory**: wybierz kolor akcentu i tła. Potem kliknij „Przywróć”.

## Uwagi
- Kolory czytelności sprawdzałem testami, ale nie oglądałem każdego ekranu na telefonie. Jeśli coś będzie słabo widoczne (np. tekst na przycisku), napisz, który motyw i gdzie.
- Motyw „Pustynia” i „Jasny” są jasne, reszta ciemna. Ciemne motywy są wygodniejsze wieczorem.

## Poprawka v7 (zgłoszenie: „3 Sznycle każdy po 80 gram” → granola)

**Przyczyna:** wyszukiwanie dopasowywało tylko początek słowa, więc „gram” i „sznycle” trafiały w złe pozycje (np. „Granola”).

**Co zmieniono:**
- Produkt jest zwracany tylko wtedy, gdy pasują WSZYSTKIE znaczące słowa wpisu. Inaczej apka mówi „nie znam” i pokazuje propozycje „Czy chodziło o”.
- Słowa-wypełniacze („każdy”, „po”, „gram”, „talerz”…) są pomijane.
- Synonimy: „sznycel/sznycle/sznycla” → Kotlet schabowy (smażony).
- Nowy wzorzec „3 sznycle każdy po 80 gram” = 3 × 80 g = 240 g; działa też „3 x 80 g sznycla”.
- W karcie posiłku przy nieznanej pozycji: propozycje, „🌐 Szukaj w internecie” (Open Food Facts, darmowe, bez klucza; działa dla produktów pakowanych, nie dla dań), „+ dodaj do bazy”, „↻ przelicz”.

**Uwaga:** jeśli w dzienniku została stara pozycja „3 Sznycle” (granola), usuń ją ręcznie i wpisz ponownie.

**Test ręczny:**
1. Dieta → wpisz „3 Sznycle każdy po 80 gram” → powinno być Kotlet schabowy (smażony), 240 g, ok. 696 kcal.
2. Wpisz „gram” → nie powinno być granoli; pojawią się propozycje lub „nie znam”.
3. Wpisz „zupa z buraków 2 talerze” → 600 g.
4. Przy nieznanym daniu kliknij „🌐 Szukaj w internecie” (działa dla produktów pakowanych, np. „nutella”).

## Zmiana: trening – wybór, ćwiczenia i przyciski (Ciało → Trening)

- Na górze wybierasz trening z listy. Pod nim widzisz jego ćwiczenia z wszystkimi danymi (serie, powtórzenia, tempo, odpoczynek, link).
- Pod listą ćwiczeń jest formularz „Dodaj ćwiczenie do: [wybrany trening]”. Ćwiczenie trafia do tego treningu, który jest wybrany.
- Przy każdym ćwiczeniu: ✏️ edytuj, ✕ usuń (z potwierdzeniem).
- Pod tym: „▶ Rozpocznij trening”, „+ Dodaj nowy” (nowy trening) i „Usuń” (wybrany trening).
- Na dole „Treningi – edycja” każdy trening ma przycisk „✓ wybierz”, który ustawia go na górze.
- Usunięto przycisk „Trening dowolny” i kategorię „Mój własny trening”.

## Zmiana: płyny, jednostki objętości i większa baza (wersja danych 7)

- **Jednostki objętości:** `l` / `litr` / `litra` (1 l = 1000 ml), `dl` (100 ml), `filiżanka` (150 ml), `butelka` (500 ml, albo waga z bazy), `puszka` (330 ml, albo waga z bazy). Już wcześniej: `ml`, `szklanka` (250), `kubek` (250), `łyżka` (15), `łyżeczka` (5).
- **Ułamki:** „pół litra mleka” = 500 ml, „ćwierć …” = 0,25.
- **Pokazywanie:** wpisy podane w jednostkach objętości są w dzienniku pokazywane w **ml**, a nie w g. Do przeliczenia na kalorie przyjmujemy 1 ml ≈ 1 g (dla mleka, soków, wody to dokładność wystarczająca).
- **Shake proteinowy:** dodane pozycje „Shake proteinowy (z wodą)”, „Shake proteinowy z mlekiem 2%”, „Shake proteinowy czekoladowy”, „Odżywka białkowa (proszek, 1 miarka 30 g)”. Wpis „shake proteinowy 500ml” daje 500 ml.
- **Baza:** dodano około 100 nowych pozycji: napoje i mleko roślinne, kefiry, soki, herbaty, kawy, zupy (kilkanaście), dania obiadowe i fast food, nabiał i ryby, przekąski i słodycze, owoce i warzywa.
- **Migracja:** istniejące bazy dostaną nowe pozycje automatycznie. Twoje własne pozycje nie są ruszane.
- **Uwaga:** wartości w bazie są orientacyjne (na 100 g / 100 ml). Jeśli coś się różni od etykiety, popraw pozycję w edycji produktów.

**Test ręczny:**
1. Dieta → „shake proteinowy 500ml” → w dzienniku 500 ml, kcal ok. 200.
2. „1 l wody” → 1000 ml. „pół litra mleka” → 500 ml. „2 butelki coli” → 660 ml.
3. „szklanka soku pomarańczowego” → 250 ml.

## Zmiana: podpowiedzi dań i „Dodaj z AI” (Dieta → Dziś → Co i ile zjadłem)

- **Podpowiedzi podczas pisania:** wpisujesz w polu, a pod nim pojawia się lista dań z bazy. Najpierw dania zaczynające się od wpisanych liter (alfabetycznie), potem te, które zawierają wpisany tekst. Przykład: „r” → Racuchy, Ramen, Ricotta…; „ros” → Rosół z kluskami, Rosół z makaronem… Kliknięcie wstawia nazwę. Jeśli przed nazwą jest ilość („150 g ros”), ilość zostaje.
- **Dodaj nie kasuje pola:** jeśli produktu nie ma w bazie, znane pozycje są dodane, a nieznana zostaje w polu i na liście „Nie znam”. Nie musisz pisać jeszcze raz.
- **✨ Dodaj z AI:** przy każdej nieznanej pozycji. Otwiera prompt tylko dla tego produktu; wklejasz odpowiedź AI, a wynik zastępuje nieznaną pozycję.
- **Porządek w polu:** gdy pozycja zostanie rozwiązana (AI, internet, wybór z listy, „↻ przelicz”) albo usunięta ✕, znika z pola, więc nie dubluje się przy kolejnym „Dodaj”.
- **Szukaj w internecie** i **+ dodaj do bazy** działają jak wcześniej.

**Test ręczny:**
1. Dieta → w polu zacznij pisać „ros” → pod polem pojawi się Rosół… Kliknij jedną pozycję.
2. Wpisz „mountain dew” (albo „qurrito z kfc”) i kliknij „Oblicz i dodaj” → pole zostaje z tą nazwą, a przy niej są przyciski.
3. Kliknij „✨ Dodaj z AI”, skopiuj prompt do czatu AI, wklej JSON i „Dodaj do posiłku”.

## Zmiana: własne posiłki i płyny (Dieta → Dziś)

- **Posiłki są Twoje:** zniknęły stałe Śniadanie / Obiad / Przekąska / Kolacja / Po treningu. Dodajesz posiłek wpisując nazwę (np. „Drugie śniadanie”) i klikając „+ Dodaj posiłek”. Pusta nazwa daje „Posiłek N”.
- Nazwę posiłku zmienisz, wpisując ją w nagłówku karty. „Usuń posiłek” kasuje posiłek razem z wpisami.
- Stare dni, w których były wpisy pod dawnymi nazwami, pokazują je dalej.
- **Płyny:** osobna karta „Płyny” zamiast licznika szklanek. Wpisujesz dowolnie, np. „1.5 l Muszynianka, 2 kubki herbaty”. Apka sumuje ml i pokazuje „wypite / cel” z paskiem.
- Nieznany napój (np. Muszynianka, której nie ma w bazie) też liczy się objętością (1,5 l = 1500 ml). Kalorie są 0, dopóki nie uzupełnisz go przez internet, AI albo bazę. Nieznany napój nie znika z sumy, kiedy wpiszesz kolejny.
- Stare przyciski „−0,25 l / +0,25 l” zniknęły. Dawne wartości z licznika nie są już pokazywane.

**Test ręczny:**
1. Dieta → Dziś: wpisz „Drugie śniadanie” i kliknij „+ Dodaj posiłek”. Dodaj do niego jedzenie.
2. W karcie „Płyny” wpisz „1.5 l Muszynianki, 2 kubki herbaty” → „Oblicz i dodaj”. Suma powinna wynosić 2,00 l.
3. Wpisz „250 ml wody” → suma wzrasta do 2,25 l.

## Zmiana: płyny dodajesz pojedynczo (Dieta → Dziś → Płyny)

- Karta „Płyny” ma teraz formularz jednego płynu: **Co wypiłem** (z podpowiedziami z bazy), **Ile** i **Jednostka** (ml, litry, szklanka, kubek, butelka, puszka). Przycisk „+ Dodaj płyn” dopisuje tylko ten jeden wpis.
- Możesz więc dodawać płyny w trakcie dnia, każdy osobno. Suma i pasek celu aktualizują się od razu.
- Pusta ilość daje 250 ml. Pusta nazwa daje komunikat i nie dodaje wpisu.
- Nieznany napój nadal liczy się objętością i ma przyciski: szukaj w internecie, dodaj z AI, dodaj do bazy, przelicz.
- Posiłki bez zmian: pole „Co i ile zjadłem” z przyciskiem „Oblicz i dodaj”.

**Test ręczny:** Dieta → Dziś → Płyny: wpisz „Muszynianka”, ilość 1,5, jednostka litry → „+ Dodaj płyn”. Potem „herbata”, 2, kubek → suma 2,00 l.

## v12 – poprawki z przeglądu (seria, rzuty, ciężar, składniki diety)

**1. Seria dni z rzędu**
- Ikona ognia to teraz grafika SVG (zamiast emoji 🔥).
- Seria liczy się po zaliczeniu wszystkich punktów minimum danego dnia. Jeśli dziś masz 0/3, licznik pokazuje wartość z wczoraj; po zaliczeniu dzisiejszego minimum liczba rośnie.

**2. Usunięty licznik „treningi siłowe”** – apka liczy treningi ogólnie, bez kategorii siłowej.

**3. Rzuty: cztery liczniki zamiast checkboxów**
- Front rim, Back rim, Swish, Airball – każdy z polem liczby z oddanych rzutów.
- Pole „Cue użyte” (wskazówka do rzutu, np. „łokieć pod piłką”) jest opcjonalne. Możesz je zostawić albo ukryć; daj znać.

**4. Trening: ciężar (kg)**
- W planie ćwiczenia jest nowe, szóste pole: `Nazwa | 4x6 | 3-1-1 | link | 120 | 62,5`. Ostatnie pole (kg) jest opcjonalne.
- W edytorze ćwiczenia jest pole „Ciężar (kg)”. Zwiększaj je z czasem.
- Na liście ćwiczeń widzisz plan i „ostatnio X kg” z ostatniej sesji.

**5. Dieta: więcej składników** (pozycje opcjonalne, na 100 g produktu)
- Błonnik, cukry, tłuszcz nasycony, sól.
- Dane są uzupełniane przez „Szukaj w internecie” (Open Food Facts) i „✨ Dodaj z AI”.
- Na ekranie Dziś jest karta „Pozostałe składniki” z sumami dnia, orientacyjnymi progami i liczbą pozycji bez danych.
- Witaminy i minerały wymagają większej bazy danych. Nie ma ich w tej wersji.

**Techniczne:** `lifeos-v12` w `sw.js`; test dymny `testy/smoke-v6.js`.

**Jeszcze nie zrobione:** zlecenie C (podpowiedzi alfabetyczne w polu posiłku; „Dodaj z AI” przy nieznanych pozycjach; nieznany produkt nie czyści pola).

## v13 – poprawki po teście v12

- **Rzuty:** przyciski − i + nie nachodzą już na pole liczby (układ w jednym rzędzie).
- **Rzuty: nowa kategoria „Non-swish (trafione, bez swisha)”** – liczy trafienia, które nie były swishem. Pojawia się przy pomiarze w liście.
- **Posiłki:** „Dodaj posiłek” ma listę rodzajów (Śniadanie, Drugie śniadanie, Obiad, Podwieczorek, Kolacja, Przekąska, Przed treningiem, Po treningu, Przekąska wieczorna) oraz pole „Albo własna nazwa” (ma pierwszeństwo). Powtórzona nazwa dostaje numer (Obiad 2).
- **Dziś:** stara „średnia z ostatnich N dni” została usunięta, zastąpiona odsyłaczem do Statystyk.
- **Dieta → Statystyki (nowa zakładka):** okres do wyboru: dzień, tydzień, miesiąc, rok, własne (np. 2 tygodnie, 3 tygodnie, 2 miesiące). Pokazuje tabelę składników (kcal, białko, węglowodany, tłuszcz, płyny, błonnik, cukry, tłuszcz nasycony, sól): razem i średnio na dzień z wpisami; wykresy kalorii i płynów dzień po dniu; napoje (ile razy i łącznie ml); tabelę dzień po dniu. Okres liczy się wstecz od wybranego dnia.
- `lifeos-v13` w `sw.js`; `testy/smoke-v6.js` rozszerzony o statystyki, Non-swish i listę posiłków.

## v14 – rzuty: drill, statystyki i wykres

- **Pomiar rzutu:** pole „Dryl” nazywa się teraz „Drill”. Wybierasz z listy głównych kategorii (Catch and Shoot 3, Catch and Shoot Midrange, Off the Dribble 3 i Midrange, Pull-up 3 i Midrange, Step-back 3, Fadeaway, Floater, Hook shot, Layup, Rzut wolny), z Twoich drilli z bloku „rzut” albo wpisujesz własny w polu pod listą.
- **Statystyki i wykres (Kosz → Pomiary):** wybierasz drill (lub „wszystkie drille”) i okres: tydzień, miesiąc, rok, własny (np. 2 tygodnie, 3 miesiące) albo wszystko. Karta pokazuje oddane, trafione, skuteczność, liczbę sesji, najlepszą i ostatnią sesję oraz rodzaje rzutów z procentami.
- **Wykres:** oś X = oddane rzuty (suma), oś Y = trafione (suma) albo skuteczność (%), do wyboru. Punkty mają etykiety, osie są opisane, a siatka ułatwia odczyt.
- `lifeos-v14` w `sw.js`; `testy/smoke-v6.js` rozszerzony o statystyki i wykres rzutów.

## v15 – poprawki bloków, tydzień na telefonie, CSV

- **Blok stały „tylko dziś”:** zmieniona nazwa, obszar, godziny, status, ocena i notatka zapisują się tylko dla tego dnia. Widok Dziś i Tydzień pokazuje te wartości, a szablon zostaje bez zmian.
- **Zakres edycji bloku stałego:** w oknie bloku wybierasz „tylko ten dzień”, „ten i kolejne” albo „cała seria”. Ten sam wybór działa przy usuwaniu. Zmiana „ten i kolejne” kończy starą serię dzień wcześniej i tworzy nową od wybranego dnia; nadpisania późniejszych dni przechodzą do nowej serii.
- **Brak domyślnych godzin:** nowy blok jednorazowy i nowy blok stały startują z pustymi polami czasu. Bloki bez godzin pokazują „bez godziny”. Usunięto fallback 08:00–09:00.
- **Tydzień na telefonie:** poniżej 760 px dni są listą pionową, bez przewijania poziomego.
- **Tydzień:** w podsumowaniu jest liczba treningów.
- **CSV pomiarów:** dodano kolumnę `non_swish`.
- Uwaga: stare bloki zapisane z godzinami 17:00 itp. zostają bez zmian, bo to dane, które już masz.
- `lifeos-v15` w `sw.js`; nowy test `testy/blocks-test.js` (ALL PASS).

- **Plan hali ↔ grafik (na stałe):** każdy blok hali ma swój blok stały w Tygodniu (dzień, godziny od–do z długości). Zmiana w hali aktualizuje grafik, usunięcie w hali usuwa wpis z grafiku. Istniejące bloki hali łączą się przy pierwszym wejściu w Plan hali.
- **Dieta:** bez zmian (zostawiamy kalkulator kcal, bazę produktów i statystyki) — decyzja użytkownika.
- **Nawigacja:** zostaje wysuwane menu, bez dolnego paska — decyzja użytkownika.

**Jeszcze nie zrobione:** synchronizacja przez konto (punkt 1). Wymaga założenia darmowego projektu Firebase przez użytkownika i podania publicznej konfiguracji (bez sekretów administracyjnych). Dopiero wtedy da się przetestować logowanie, offline, kolejkę i sync na dwóch urządzeniach.

## v16 – Tydzień: przełącznik bloków i czytelne kafelki

- **Kliknięcie bloku w Tygodniu** przełącza go między wykonanym a niewykonanym (tylko ten dzień, jak status w Dziś). Drugi klik cofa, więc pomyłka nie jest problemem.
- **Edycja** jest pod małym przyciskiem ✎ w rogu kafelka. Otwiera okno bloku z zakresem zmiany (ten dzień / ten i kolejne / cała seria).
- **Większe kafelki:** wyraźniejsza nazwa (16,5 px), godziny, podpis stanu („dotknij, żeby oznaczyć” / „wykonane · dotknij, żeby cofnąć”), szersze kolumny (min. 176 px).
- **Lista pionowa** poniżej 900 px (wcześniej 760 px), więc na tablecie i telefonie nie ma przewijania poziomego.
- `lifeos-v16` w `sw.js`; `testy/blocks-test.js` rozszerzony o przełącznik (ALL PASS).

## v17 – Tydzień na całą szerokość

- Ekran Tydzień używa całej szerokości strony. Siedem dni mieści się obok siebie bez paska do przesuwania.
- Na ekranach węższych niż 900 px dni są pionową listą, bez przewijania poziomego.
- Pozostałe ekrany mają dalej stałą szerokość treści (820 px).
- `lifeos-v17` w `sw.js`.
