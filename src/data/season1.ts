export type Episode = {
  code: string;
  title: string;
  description: string;
};

export type SeasonLocationEvent = {
  episode: string;
  action: string;
};

export type SeasonLocation = {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  events: SeasonLocationEvent[];
};

export const seasonEpisodes: Episode[] = [
  {
    code: 'S01E01',
    title: 'Pierwszy dzien w Lesnej Szkole',
    description:
      'Bruno i Fela rozpoczynaja nauke w Lesnej Szkole pod Wielkim Debem. Poznaja nowych przyjaciol i przekonuja sie, ze pierwszy dzien szkoly wcale nie musi byc straszny.',
  },
  {
    code: 'S01E02',
    title: 'Wielki Wyscig do Dzwonka',
    description:
      'Fela chce udowodnic, ze jest najszybsza w lesie. Czy pewnosc siebie wystarczy do zwyciestwa i czego nauczy ich ten wyscig?',
  },
  {
    code: 'S01E03',
    title: 'Domek dla Jezyka Julka',
    description:
      'Uczniowie dostaja zadanie zbudowania domku dla Jezyka Julka. Bruno planuje, Fela dziala od razu - czy uda im sie wspolpracowac?',
  },
  {
    code: 'S01E04',
    title: 'Pierwsza klasowka z szyszek',
    description:
      'Bruno jest spokojny przed klasowka, a Fela stresuje sie nauka. Historia o wspolnej nauce, wsparciu i proszeniu o pomoc.',
  },
  {
    code: 'S01E05',
    title: 'Nocowanie pod Wielkim Debem',
    description:
      'Najbardziej wyczekiwany wieczor semestru. Gdy zapada zmrok, las brzmi inaczej i bohaterowie odkrywaja, czym jest prawdziwa odwaga.',
  },
  {
    code: 'S01E06',
    title: 'Najwiekszy Skoczek Lesnej Szkoly',
    description:
      'Po deszczu pojawia sie ogromna kaluza. Bruno i Fela szukaja sposobu, by ja pokonac i ucza sie, ze rywalizacja to nie wszystko.',
  },
  {
    code: 'S01E07',
    title: 'Dzien Zamiany Talentow',
    description:
      'Bruno i Fela zamieniaja sie rolami. Pelna humoru opowiesc o tym, ze kazdy ma inne talenty i warto doceniac roznice.',
  },
  {
    code: 'S01E08',
    title: 'Zaginiona mapa wyprawy',
    description:
      'Znika mapa prowadzaca na Lesna Polane Odkrywcow. Tylko wspolne laczenie tropow moze doprowadzic do rozwiazania zagadki.',
  },
  {
    code: 'S01E09',
    title: 'Wielki Mecz Lasu',
    description:
      'Fela marzy o zwycieskim golu, Bruno przygotowuje taktyke. Odcinek pokazuje, ze najwazniejsza jest wspolpraca calej druzyny.',
  },
  {
    code: 'S01E10',
    title: 'Wielki Piknik Lesnej Szkoly',
    description:
      'Final sezonu. Bruno i Fela wspominaja przygody, a niespodziewane zamieszanie podczas pikniku zamienia sie we wspolna zabawe.',
  },
];

export const season2Episodes: Episode[] = [
  {
    code: 'S02E01',
    title: 'Wakacje sie zaczynaja',
    description:
      'Rozpoczynaja sie wakacje w Lesie Szumiacych Lisci. Bruno i Fela zegnaja Lesna Szkole i tworza swoja Liste Wakacyjnych Przygod. Czy uda im sie przezyc najlepsze lato w zyciu?',
  },
  {
    code: 'S02E02',
    title: 'Tajemnicza Mapa Odkrywcow',
    description:
      'Bruno i Fela odnajduja stary, tajemniczy fragment mapy z zagadkowa wskazowka. Wyruszaja na pierwsza wakacyjna wyprawe, nie wiedzac jeszcze, ze to dopiero poczatek najwiekszej przygody w Lesie Szumiacych Lisci.',
  },
  {
    code: 'S02E03',
    title: 'Wodospad Siedmiu Kropel',
    description:
      'Bruno i Fela podazaja za kolejna wskazowka tajemniczej mapy, ktora prowadzi ich do niezwyklego Wodospadu Siedmiu Kropel. Czy uda im sie odnalezc ukryta wiadomosc? A moze tym razem wyzwaniem okaze sie... cierpliwosc?',
  },
  {
    code: 'S02E04',
    title: 'Wielka Wyprawa Tratwa',
    description:
      'Bruno i Fela buduja wlasna tratwe i wyruszaja w niezwykly rejs po lesnym strumyku. Gdy wyprawa niespodziewanie sie zatrzymuje, odkrywaja tajemnicza buteleczke z kolejna wskazowka.',
  },
  {
    code: 'S02E05',
    title: 'Dzien Bez Slow',
    description:
      'Bruno i Fela podejmuja niezwykle wyzwanie - probuja porozumiewac sie bez wypowiadania ani jednego slowa. Bajka o przyjazni, komunikacji i tym, ze czasem mozna powiedziec najwiecej nie mowiac nic.',
  },
  {
    code: 'S02E06',
    title: 'Lesny Piknik',
    description:
      'Bruno i Fela organizuja wielki piknik dla przyjaciol. Gdy tajemniczo znika koszyk z kanapkami, bohaterowie odkrywaja, ze dzielenie sie z innymi przynosi najpiekniejsze niespodzianki.',
  },
  {
    code: 'S02E07',
    title: 'Stary Wiatrak',
    description:
      'Bruno i Fela podazaja za wskazowka tajemniczej mapy i trafiaja do starego wiatraka skrywajacego niezwykly sekret. Pomagajac innym, otwieraja drzwi do kolejnej przygody.',
  },
  {
    code: 'S02E08',
    title: 'Jaskinia Echo',
    description:
      'Bruno i Fela trafiaja do niezwyklej Jaskini Echo. W jej ciemnych zakamarkach czeka kolejny fragment mapy oraz zagadka zmuszajaca do uwaznego sluchania.',
  },
  {
    code: 'S02E09',
    title: 'Klub Odkrywcow',
    description:
      'Po polaczeniu wszystkich fragmentow tajemniczej mapy bohaterowie odkrywaja ukryte miejsce i zakladaja wlasny Klub Odkrywcow Lasu Szumiacych Lisci.',
  },
  {
    code: 'S02E10',
    title: 'Najwiekszy Skarb Wakacji',
    description:
      'Bruno, Fela i przyjaciele docieraja do miejsca wskazanego na tajemniczej mapie. Wzruszajace i pelne humoru zakonczenie drugiego sezonu o przyjazni i odkrywaniu, ze najcenniejsze skarby mamy tuz obok siebie.',
  },
];

export const season2MapData: SeasonLocation[] = [
  {
    id: 's02e01',
    name: '1. Wakacje sie zaczynaja',
    icon: '1️⃣',
    x: 11,
    y: 23,
    events: [{ episode: 'S02E01', action: 'Poczatek wakacji i stworzenie Listy Wakacyjnych Przygod.' }],
  },
  {
    id: 's02e02',
    name: '2. Tajemnicza Mapa Odkrywcow',
    icon: '2️⃣',
    x: 30,
    y: 29,
    events: [{ episode: 'S02E02', action: 'Pierwsza zagadka mapy i trop przy szumiacej wodzie.' }],
  },
  {
    id: 's02e03',
    name: '3. Wodospad Siedmiu Kropel',
    icon: '3️⃣',
    x: 52,
    y: 33,
    events: [{ episode: 'S02E03', action: 'Poszukiwanie ukrytej wiadomosci i lekcja cierpliwosci.' }],
  },
  {
    id: 's02e04',
    name: '4. Wielka Wyprawa Tratwa',
    icon: '4️⃣',
    x: 69,
    y: 23,
    events: [{ episode: 'S02E04', action: 'Wyprawa tratwa i odkrycie buteleczki z kolejna wskazowka.' }],
  },
  {
    id: 's02e05',
    name: '5. Dzien Bez Slow',
    icon: '5️⃣',
    x: 33,
    y: 58,
    events: [{ episode: 'S02E05', action: 'Dzien Bez Slow i wspolpraca oparta na gestach.' }],
  },
  {
    id: 's02e06',
    name: '6. Lesny Piknik',
    icon: '6️⃣',
    x: 49,
    y: 55,
    events: [{ episode: 'S02E06', action: 'Lesny piknik i tajemnica zaginionego koszyka z kanapkami.' }],
  },
  {
    id: 's02e07',
    name: '7. Stary Wiatrak',
    icon: '7️⃣',
    x: 88,
    y: 57,
    events: [{ episode: 'S02E07', action: 'Wyprawa do wiatraka i odkrycie sekretu dzieki pomocy innym.' }],
  },
  {
    id: 's02e08',
    name: '8. Jaskinia Echo',
    icon: '8️⃣',
    x: 89,
    y: 24,
    events: [{ episode: 'S02E08', action: 'Kolejny fragment mapy i zagadka wymagajaca uwaznego sluchania.' }],
  },
  {
    id: 's02e09',
    name: '9. Klub Odkrywcow',
    icon: '9️⃣',
    x: 32,
    y: 89,
    events: [{ episode: 'S02E09', action: 'Polaczenie fragmentow mapy i zalozenie Klubu Odkrywcow.' }],
  },
  {
    id: 's02e10',
    name: '10. Najwiekszy Skarb Wakacji',
    icon: '🔟',
    x: 73,
    y: 92,
    events: [{ episode: 'S02E10', action: 'Final wyprawy i odkrycie, czym naprawde jest najwiekszy skarb wakacji.' }],
  },
];

export const seasonMapData: SeasonLocation[] = [
  {
    id: 'school',
    name: 'Lesna Szkola pod Debem',
    icon: '🏫',
    x: 21,
    y: 56,
    events: [
      { episode: 'S01E01', action: 'Pierwszy dzien szkoly i poznanie klasy Pani Sowy.' },
      { episode: 'S01E03', action: 'Bruno i Fela buduja schronienie dla Jezyka Julka.' },
      { episode: 'S01E04', action: 'Wielka klasowka z rozpoznawania szyszek.' },
      { episode: 'S01E07', action: 'Dzien zamiany rol i wspolna budowa karmnika.' },
    ],
  },
  {
    id: 'dzwonek',
    name: 'Plac i trasa do dzwonka',
    icon: '🏁',
    x: 50,
    y: 52,
    events: [
      {
        episode: 'S01E02',
        action: 'Wyscig wokol debu, przez mostek nad strumykiem i z powrotem na plac.',
      },
    ],
  },
  {
    id: 'polana',
    name: 'Polana Odkrywcow',
    icon: '🏕️',
    x: 74,
    y: 34,
    events: [
      { episode: 'S01E05', action: 'Nocowanie pod Wielkim Debem i nocne odglosy lasu.' },
      { episode: 'S01E09', action: 'Wielki mecz z bramkami ustawionymi na polanie.' },
      { episode: 'S01E10', action: 'Wielki Piknik Lesnej Szkoly i finalowe wspomnienia sezonu.' },
    ],
  },
  {
    id: 'kaluza',
    name: 'Lesna sciezka po burzy',
    icon: '💧',
    x: 83,
    y: 67,
    events: [
      { episode: 'S01E06', action: 'Najwieksza Kaluza Swiata i budowa mostu dla calej klasy.' },
    ],
  },
  {
    id: 'ogrodek',
    name: 'Szkolny ogrodek',
    icon: '🌿',
    x: 17,
    y: 86,
    events: [
      { episode: 'S01E01', action: 'Zwiedzanie szkolnego ogrodka i lesnej biblioteki.' },
      { episode: 'S01E08', action: 'Trop swiezego listka prowadzi do rozwiazania zagadki mapy.' },
    ],
  },
  {
    id: 'gniazdo',
    name: 'Stare gniazdo sroki',
    icon: '🪺',
    x: 10,
    y: 18,
    events: [{ episode: 'S01E08', action: 'W gniezdzie odnaleziono zaginiona mape wyprawy.' }],
  },
  {
    id: 'boisko',
    name: 'Lesne boisko',
    icon: '⚽',
    x: 46,
    y: 28,
    events: [
      { episode: 'S01E09', action: 'Wspolna gra zespolowa i gol Jezyka Julka.' },
      { episode: 'S01E10', action: 'Wspomnienia meczu podczas przygotowan do pikniku.' },
    ],
  },
];
