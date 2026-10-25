# LIFE OS – v4: Dieta z makrami i Trening z zapisem serii

## Co się zmieniło

### 🥗 DIETA
- **Kalkulator** (zakładka Kalkulator): płeć, wiek, wzrost, waga (puste = ostatni pomiar wagi), aktywność, cel kalorii (utrzymanie / +200 / +300 / +400), białko i tłuszcz w g/kg.
  - Liczy BMR (wzór Mifflin-St Jeor), potem TDEE (BMR × aktywność), potem cel kcal.
  - Białko 2 g/kg, tłuszcz 0,9 g/kg, węglowodany to reszta kalorii.
  - Dopóki nie wpiszesz wieku i wzrostu (i nie masz wagi), apka nie pokazuje celu. Nic nie jest wpisane na sztywno.
- **Dziś – posiłki**: Śniadanie, Obiad, Przekąska, Kolacja, Po treningu.
  - Wpisujesz „co i ile”, np. `200 g kurczaka, 100 g ryżu, 2 jajka, 1 banan, łyżka masła orzechowego`.
  - Apka liczy kcal, białko, węglowodany i tłuszcz dla każdej pozycji i dla całego posiłku.
  - Pasek postępu pokazuje, ile zostało do celu (kcal, B, W, T).
- **Nieznany produkt** zostaje oznaczony „brak w bazie”. Możesz go dodać do bazy jednym przyciskiem albo przeliczyć po dodaniu.
- **🤖 Przez AI**: apka nie łączy się z AI (bez klucza API i bez płatności). Robisz to tak:
  1. Wpisz posiłek w pole i kliknij „Przez AI”.
  2. Kliknij „Kopiuj prompt” i wklej go w dowolnym czacie AI (ChatGPT, Gemini, Claude).
  3. Skopiuj odpowiedź (JSON w nawiasach `[ ]`) i wklej w okno w apce. Kliknij „Dodaj do posiłku”.
- **Produkty**: baza ~30 produktów z wartościami na 100 g (i wagą 1 sztuki, np. jajko 60 g). Możesz ją edytować i dodawać własne.
- Waga, sen i woda działają jak wcześniej. Dodano średnią z 7 dni.

### 🏋️ TRENING (Ciało › Trening)
- **Rozpocznij trening** otwiera sesję dla wybranego treningu. Wpisujesz kg i powtórzenia w każdej serii.
- **Serie**: przycisk „+ seria” dodaje serię ponad plan, „− usuń ostatnią” ją zdejmuje.
- **Podpowiedź „ostatnio”**: pod ćwiczeniem widzisz wyniki z ostatniej sesji z tym ćwiczeniem. Kolor zielony.
- **Odpoczynek**: zaznaczenie serii (☑) uruchamia timer odpoczynku. Czas bierze się z szablonu treningu.
- **RPE** (jak ciężko, 1–10) i **notatka** przed zakończeniem.
- **Zakończ i zapisz**: zapisuje sesję w historii z czasem trwania i objętością (Σ kg × powtórzenia).
- **Szkic**: jeśli zamkniesz apkę w trakcie, trening czeka na Ciebie po powrocie.
- **Odrzuć trening**: kasuje szkic.
- **Historia** pokazuje ostatnie 10 treningów.
- **Progresja**: wykres szacowanego 1RM (ciężar maksymalny na 1 powtórzenie) dla wybranego ćwiczenia. Wzór Epleya: kg × (1 + powt/30).

### Format szablonu treningu (Ciało › Trening › edycja)
Jedno ćwiczenie w linii:

`Nazwa | 3x8 | tempo | link | odpoczynek w sekundach`

Przykład: `Przysiad | 3x5 | 2-0-1 | https://… | 120`
Jeśli nie podasz 5. pola, odpoczynek wynosi 90 s.

## Co się NIE zmieniło
- Dane są nadal lokalne (w tej przeglądarce). Eksport i import JSON działają jak wcześniej.
- Stare dane z v1–v3 wczytują się bez zmian. Dodane zostały tylko nowe pola (baza produktów, profil, szkic treningu).
- Dzień, tydzień, kosz, biznes, kompas i przegląd nie zmieniły się.

## Pliki
- `app.js` – cała logika (sekcje oznaczone `// === NAZWA ===`; Ciało i Dieta są przepisane).
- `index.html` – wygląd (dodano kilka stylów dla serii i wykresów).
- `sw.js` – pamięć podręczna zmieniona na `lifeos-v5`, więc telefon pobierze nową wersję.
- `testy/test-v4.js` – test logiki (obliczenia, parser posiłków, zapis treningu, import z AI).

---

## Jak przetestować (krok po kroku)

### A. Test automatyczny (na komputerze, 10 sekund)
1. Otwórz terminal w folderze `lifeos`.
2. Wpisz: `node testy/test-v4.js`
3. Na końcu powinno być: **ALL PASS**. Jeśli jest FAIL, napisz mi, która linia.

### B. Test w przeglądarce
1. Otwórz apkę (link podglądu albo plik `index.html`).
2. **Kalkulator**: DIETA → Kalkulator. Wpisz wiek 16, wzrost, wagę. Sprawdź, czy cel kcal i makra się pojawiły. Zmień aktywność i cel (np. +400) i zobacz, jak zmienia się wynik.
3. **Posiłek**: DIETA → Dziś → Obiad. Wpisz `200 g kurczaka, 100 g ryżu, xyz` i kliknij „Oblicz i dodaj”.
   - Kurczak = 240 kcal, ryż gotowany = 130 kcal, a `xyz` ma być oznaczone „brak w bazie”.
   - Kliknij „+ dodaj do bazy” przy `xyz`, wpisz wartości, zapisz.
   - Kliknij „↻ przelicz” i sprawdź, czy pozycja się zaktualizowała.
4. **AI**: w polu Kolacja wpisz `pizza margherita 300 g` → „🤖 Przez AI” → „Kopiuj prompt”. Wklej prompt w czacie AI, a odpowiedź JSON (samą tablicę) wklej w apce i kliknij „Dodaj do posiłku”.
5. **Trening**: CIAŁO → Trening → „▶ Rozpocznij trening” (najpierw wpisz ćwiczenia, jeśli szablon jest pusty).
   - Wpisz kg i powtórzenia w pierwszej serii, zaznacz ☑. Powinien ruszyć timer odpoczynku na dole ekranu.
   - Dodaj serię przyciskiem „+ seria”.
   - Kliknij „Zakończ i zapisz”. Trening pojawi się w historii z objętością.
6. **Podpowiedź „ostatnio”**: rozpocznij ten sam trening ponownie. Przy ćwiczeniach powinny być wyniki z poprzedniego razu.
7. **Szkic**: rozpocznij trening, odśwież stronę. Trening ma być nadal aktywny, a licznik czasu leci dalej.
8. **Zgodność**: wejdź w USTAWIENIA → Eksport JSON, potem Import JSON tego pliku. Dane mają wrócić bez zmian.

## Czego jeszcze nie ma (zostawiam na później)
- Połączenie z AI bez kopiowania (wymaga klucza API, czyli płatności; nie robimy tego, skoro wszystko ma być darmowe).
- Chmura i logowanie Google (Firebase) – to krok 4, po Twojej akceptacji.
- Wartości produktów są orientacyjne (z ogólnych tabel). Przy ważnych produktach sprawdź etykietę.
