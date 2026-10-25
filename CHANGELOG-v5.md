# LIFE OS – v5: woda w litrach, duża baza dań, własne treningi, nowy wygląd

## Co się zmieniło

### 💧 Woda w litrach
- Zamiast szklanek są **litry** (przyciski: −0,25 l, +0,25 l, +0,5 l).
- **Cel wody** = waga × 35 ml/kg (np. 78 kg → 2,7 l). Współczynnik 35 ml/kg jest w Kalkulatorze i można go zmienić.
- Pasek pokazuje, ile z celu już wypiłeś.
- Stare wpisy w szklankach się nie przeliczają. Woda zaczyna się od zera w litrach.

### 🍕 Baza dań i produktów (214 pozycji)
- Plik `produkty.js` zawiera:
  - **nabiał i jaja**, **mięsa i wędliny**, **ryby**,
  - **dania polskie** (pierogi, naleśniki, bigos, gołąbki, kopytka, zupy: pomidorowa, żurek, rosół…),
  - **makarony, ryż, kasze, płatki**,
  - **fast food i gotowe**: pizza (margherita, salami, pepperoni, hawajska, 4 sery…), pizza z ciasta z Biedronki („Ciasto na pizzę gotowe”, „Pizza ze sklepu – 1/4”), kebab, burger, nuggetsy, hot dog, frytki, zapiekanka, sushi, chipsy,
  - **słodycze i napoje** (drożdżówka, sernik, pączek, cola, sok),
  - **warzywa, owoce, orzechy, sosy, dodatki**.
- Przy daniach typu pizza, kebab czy burger wpisujesz porcję jako kawałek lub sztukę (np. `2 kawałki pizzy salami`, `1 kebab w pita`).
- Istniejące bazy dostają nowe pozycje automatycznie. Twoje własne produkty zostają bez zmian.
- Wartości są **orientacyjne** (z ogólnych tabel, na 100 g). Przy pizzy z konkretnego sklepu lub gotowych produktów sprawdź etykietę i dodaj własny produkt.

### 🏋️ Trening – własne ćwiczenia
- Nowy przycisk **„✏️ Trening dowolny”**: zaczynasz pusty i sam dodajesz ćwiczenia.
- W trakcie każdego treningu możesz:
  - **dodać ćwiczenie** (nazwa, liczba serii, powtórzeń, odpoczynek). Podpowiada nazwy z historii i szablonów,
  - **zmienić nazwę treningu**,
  - **usunąć ćwiczenie** (🗑) albo dodać/zdjąć serię.
- Szablony treningów (Siła A itd.) działają jak wcześniej i można je też edytować.

### 🎨 Nowy wygląd
- Jasny, ciepły motyw: kremowe tło, białe karty, pomarańczowy akcent i zielone/niebieskie wskaźniki.
- Większe odstępy, miększe cienie, zaokrąglone elementy.
- Wiersze serii mają numer w kółku, a zrobione serie są podświetlone na zielono.
- Wykresy i okna dopasowane do jasnego tła.

## Co się NIE zmieniło
- Dane są nadal lokalne (w tej przeglądarce). Eksport i import JSON działają jak wcześniej.
- Dzień, tydzień, kosz, biznes, kompas i przegląd działają jak wcześniej.

## Pliki
- `index.html` – nowy wygląd.
- `app.js` – woda, trening dowolny, migracja bazy.
- `produkty.js` – **nowy plik**, baza produktów i dań. Dodawaj tu nowe pozycje albo w apce (DIETA › Produkty).
- `sw.js` – wersja pamięci `lifeos-v6` (dodany `produkty.js`).
- `manifest.json` – kolory jasnego motywu.
- `testy/test-v4.js` – test logiki (zaktualizowany).

## Jak przetestować

### A. Test automatyczny
1. W folderze `lifeos` wpisz: `node testy/test-v4.js`
2. Na końcu powinno być **ALL PASS**.

### B. W przeglądarce
1. **Woda**: DIETA › Dziś. Kliknij „+0,25 l” kilka razy. Sprawdź, czy wynik i pasek rosną. Cel przy wadze 78 kg powinien wynosić 2,70 l.
2. **Pizza z Biedronki**: DIETA › Dziś › Obiad. Wpisz `1/4 pizzy ze sklepu` albo `2 kawałki pizzy salami`. Sprawdź wartości.
3. **Szukanie**: DIETA › Produkty. W polu „szukaj” wpisz `pierogi` albo `kebab`.
4. **Trening dowolny**: CIAŁO › Trening › „✏️ Trening dowolny”. Dodaj 2 ćwiczenia z serią i kliknij „Zakończ i zapisz”. Sprawdź w historii.
5. **Wygląd**: przejdź po zakładkach na telefonie i powiedz, czy kolory i odstępy Ci pasują. Mogę je jeszcze zmienić.

## Uwagi
- Wartości w bazie są przybliżone. Przy diecie na serio dla dokładności warto ważyć jedzenie.
- Zamknięcie apki w trakcie treningu nie kasuje go: szkic czeka na powrót.
