# Bruno i Fela iOS (Expo)

MVP gry mobilnej dla dzieci oparty o sluchowisko Bruno i Fela.

## Co jest gotowe

- Ekran mapy sezonu 1 (Las Szumiacych Lisci) z punktami przygod
- Ekran powitalny (start przygody)
- Ekran opisow odcinkow S01E01-S01E10
- Ekran mini-quizu: 3 pytania na odcinek i system gwiazdek
- Losowanie kolejnosci odpowiedzi w quizie
- Odblokowywanie kolejnych odcinkow po zdobyciu min. 2/3 gwiazdek
- Minigra zrecznosciowa (tap target przez 20 sekund)
- Minigra typu match-3 (zamiana sasiednich pol)
- Dzwiekowe komunikaty (expo-speech) przy trafieniach, wynikach i combo
- Animowany feedback punktow i wynikow (+1, +N, wynik quizu)
- Dzienny cel dziecka: 10 gwiazdek i 2 rundy minigier (zapis lokalny)
- Lokalny zapis postepu (gwiazdki i ostatnio wybrany odcinek po restarcie aplikacji)
- Przycisk "Reset postepu" z potwierdzeniem
- Reuzycie grafik z repozytorium brunoifela (w tym mapa sezonu)

## Uruchomienie (Expo Go)

1. Zainstaluj Expo Go na iPhone.
2. W tym katalogu uruchom:

```bash
npm install
npm run start
```

3. Zeskanuj kod QR aplikacja Expo Go.

## Rozwoj pod iOS i TestFlight

1. Zaloguj sie do Expo account:

```bash
npx expo login
```

2. Skonfiguruj EAS Build:

```bash
npx eas build:configure
```

3. Zbuduj paczke iOS na TestFlight:

```bash
npx eas build -p ios
```

4. Wyslij build do App Store Connect / TestFlight:

```bash
npx eas submit -p ios
```

## Kolejne kroki produktu

- Dodac modul sezonow (sezon 2 jako osobna mapa i misje)
- Dodac audio-narracje fragmentow sluchowiska
- Dodac dodatkowe minigry (memory, dopasowywanie)
- Dodac profil rodzica (czas gry, postep dziecka)
