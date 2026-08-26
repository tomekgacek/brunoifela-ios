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
    title: 'Pierwszy dzień w Leśnej Szkole',
    description:
      'Bruno i Fela rozpoczynają naukę w Leśnej Szkole pod Wielkim Dębem. Poznają nowych przyjaciół i przekonują się, że pierwszy dzień szkoły wcale nie musi być straszny.',
  },
  {
    code: 'S01E02',
    title: 'Wielki Wyścig do Dzwonka',
    description:
      'Fela chce udowodnić, że jest najszybsza w lesie. Czy pewność siebie wystarczy do zwycięstwa i czego nauczy ich ten wyścig?',
  },
  {
    code: 'S01E03',
    title: 'Domek dla Jeżyka Julka',
    description:
      'Uczniowie dostają zadanie zbudowania domku dla Jeżyka Julka. Bruno planuje, Fela działa od razu - czy uda im się współpracować?',
  },
  {
    code: 'S01E04',
    title: 'Pierwsza klasówka z szyszek',
    description:
      'Bruno jest spokojny przed klasówką, a Fela stresuje się nauką. Historia o wspólnej nauce, wsparciu i proszeniu o pomoc.',
  },
  {
    code: 'S01E05',
    title: 'Nocowanie pod Wielkim Dębem',
    description:
      'Najbardziej wyczekiwany wieczór semestru. Gdy zapada zmrok, las brzmi inaczej i bohaterowie odkrywają, czym jest prawdziwa odwaga.',
  },
  {
    code: 'S01E06',
    title: 'Największy Skoczek Leśnej Szkoły',
    description:
      'Po deszczu pojawia się ogromna kałuża. Bruno i Fela szukają sposobu, by ją pokonać i uczą się, że rywalizacja to nie wszystko.',
  },
  {
    code: 'S01E07',
    title: 'Dzień Zamiany Talentów',
    description:
      'Bruno i Fela zamieniają się rolami. Pełna humoru opowieść o tym, że każdy ma inne talenty i warto doceniać różnice.',
  },
  {
    code: 'S01E08',
    title: 'Zaginiona mapa wyprawy',
    description:
      'Znika mapa prowadząca na Leśną Polanę Odkrywców. Tylko wspólne łączenie tropów może doprowadzić do rozwiązania zagadki.',
  },
  {
    code: 'S01E09',
    title: 'Wielki Mecz Lasu',
    description:
      'Fela marzy o zwycięskim golu, Bruno przygotowuje taktykę. Odcinek pokazuje, że najważniejsza jest współpraca całej drużyny.',
  },
  {
    code: 'S01E10',
    title: 'Wielki Piknik Leśnej Szkoły',
    description:
      'Finał sezonu. Bruno i Fela wspominają przygody, a niespodziewane zamieszanie podczas pikniku zamienia się we wspólną zabawę.',
  },
];

export const season2Episodes: Episode[] = [
  {
    code: 'S02E01',
    title: 'Wakacje się zaczynają',
    description:
      'Rozpoczynają się wakacje w Lesie Szumiących Liści. Bruno i Fela żegnają Leśną Szkołę i tworzą swoją Listę Wakacyjnych Przygód. Czy uda im się przeżyć najlepsze lato w życiu?',
  },
  {
    code: 'S02E02',
    title: 'Tajemnicza Mapa Odkrywców',
    description:
      'Bruno i Fela odnajdują stary, tajemniczy fragment mapy z zagadkową wskazówką. Wyruszają na pierwszą wakacyjną wyprawę, nie wiedząc jeszcze, że to dopiero początek największej przygody w Lesie Szumiących Liści.',
  },
  {
    code: 'S02E03',
    title: 'Wodospad Siedmiu Kropel',
    description:
      'Bruno i Fela podążają za kolejną wskazówką tajemniczej mapy, która prowadzi ich do niezwykłego Wodospadu Siedmiu Kropel. Czy uda im się odnaleźć ukrytą wiadomość? A może tym razem wyzwaniem okaże się... cierpliwość?',
  },
  {
    code: 'S02E04',
    title: 'Wielka Wyprawa Tratwa',
    description:
      'Bruno i Fela budują własną tratwę i wyruszają w niezwykły rejs po leśnym strumyku. Gdy wyprawa niespodziewanie się zatrzymuje, odkrywają tajemniczą buteleczkę z kolejną wskazówką.',
  },
  {
    code: 'S02E05',
    title: 'Dzień Bez Słów',
    description:
      'Bruno i Fela podejmują niezwykłe wyzwanie - próbują porozumiewać się bez wypowiadania ani jednego słowa. Bajka o przyjaźni, komunikacji i tym, że czasem można powiedzieć najwięcej nie mówiąc nic.',
  },
  {
    code: 'S02E06',
    title: 'Leśny Piknik',
    description:
      'Bruno i Fela organizują wielki piknik dla przyjaciół. Gdy tajemniczo znika koszyk z kanapkami, bohaterowie odkrywają, że dzielenie się z innymi przynosi najpiękniejsze niespodzianki.',
  },
  {
    code: 'S02E07',
    title: 'Stary Wiatrak',
    description:
      'Bruno i Fela podążają za wskazówką tajemniczej mapy i trafiają do starego wiatraka skrywającego niezwykły sekret. Pomagając innym, otwierają drzwi do kolejnej przygody.',
  },
  {
    code: 'S02E08',
    title: 'Jaskinia Echo',
    description:
      'Bruno i Fela trafiają do niezwykłej Jaskini Echo. W jej ciemnych zakamarkach czeka kolejny fragment mapy oraz zagadka zmuszająca do uważnego słuchania.',
  },
  {
    code: 'S02E09',
    title: 'Klub Odkrywców',
    description:
      'Po połączeniu wszystkich fragmentów tajemniczej mapy bohaterowie odkrywają ukryte miejsce i zakładają własny Klub Odkrywców Lasu Szumiących Liści.',
  },
  {
    code: 'S02E10',
    title: 'Największy Skarb Wakacji',
    description:
      'Bruno, Fela i przyjaciele docierają do miejsca wskazanego na tajemniczej mapie. Wzruszające i pełne humoru zakończenie drugiego sezonu o przyjaźni i odkrywaniu, że najcenniejsze skarby mamy tuż obok siebie.',
  },
];

export const season2MapData: SeasonLocation[] = [
  {
    id: 's02e01',
    name: '1. Wakacje się zaczynają',
    icon: '1️⃣',
    x: 11,
    y: 23,
    events: [{ episode: 'S02E01', action: 'Początek wakacji i stworzenie Listy Wakacyjnych Przygód.' }],
  },
  {
    id: 's02e02',
    name: '2. Tajemnicza Mapa Odkrywców',
    icon: '2️⃣',
    x: 30,
    y: 29,
    events: [{ episode: 'S02E02', action: 'Pierwsza zagadka mapy i trop przy szumiącej wodzie.' }],
  },
  {
    id: 's02e03',
    name: '3. Wodospad Siedmiu Kropel',
    icon: '3️⃣',
    x: 52,
    y: 33,
    events: [{ episode: 'S02E03', action: 'Poszukiwanie ukrytej wiadomości i lekcja cierpliwości.' }],
  },
  {
    id: 's02e04',
    name: '4. Wielka Wyprawa Tratwa',
    icon: '4️⃣',
    x: 69,
    y: 23,
    events: [{ episode: 'S02E04', action: 'Wyprawa tratwą i odkrycie buteleczki z kolejną wskazówką.' }],
  },
  {
    id: 's02e05',
    name: '5. Dzień Bez Słów',
    icon: '5️⃣',
    x: 33,
    y: 58,
    events: [{ episode: 'S02E05', action: 'Dzień Bez Słów i współpraca oparta na gestach.' }],
  },
  {
    id: 's02e06',
    name: '6. Leśny Piknik',
    icon: '6️⃣',
    x: 49,
    y: 55,
    events: [{ episode: 'S02E06', action: 'Leśny piknik i tajemnica zaginionego koszyka z kanapkami.' }],
  },
  {
    id: 's02e07',
    name: '7. Stary Wiatrak',
    icon: '7️⃣',
    x: 88,
    y: 57,
    events: [{ episode: 'S02E07', action: 'Wyprawa do wiatraka i odkrycie sekretu dzięki pomocy innym.' }],
  },
  {
    id: 's02e08',
    name: '8. Jaskinia Echo',
    icon: '8️⃣',
    x: 89,
    y: 24,
    events: [{ episode: 'S02E08', action: 'Kolejny fragment mapy i zagadka wymagająca uważnego słuchania.' }],
  },
  {
    id: 's02e09',
    name: '9. Klub Odkrywców',
    icon: '9️⃣',
    x: 32,
    y: 89,
    events: [{ episode: 'S02E09', action: 'Połączenie fragmentów mapy i założenie Klubu Odkrywców.' }],
  },
  {
    id: 's02e10',
    name: '10. Największy Skarb Wakacji',
    icon: '🔟',
    x: 73,
    y: 92,
    events: [{ episode: 'S02E10', action: 'Finał wyprawy i odkrycie, czym naprawdę jest największy skarb wakacji.' }],
  },
];

export const seasonMapData: SeasonLocation[] = [
  {
    id: 'school',
    name: 'Leśna Szkoła pod Dębem',
    icon: '🏫',
    x: 21,
    y: 56,
    events: [
      { episode: 'S01E01', action: 'Pierwszy dzień szkoły i poznanie klasy Pani Sowy.' },
      { episode: 'S01E03', action: 'Bruno i Fela budują schronienie dla Jeżyka Julka.' },
      { episode: 'S01E04', action: 'Wielka klasówka z rozpoznawania szyszek.' },
      { episode: 'S01E07', action: 'Dzień zamiany ról i wspólna budowa karmnika.' },
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
        action: 'Wyścig wokół dębu, przez mostek nad strumykiem i z powrotem na plac.',
      },
    ],
  },
  {
    id: 'polana',
    name: 'Polana Odkrywców',
    icon: '🏕️',
    x: 74,
    y: 34,
    events: [
      { episode: 'S01E05', action: 'Nocowanie pod Wielkim Dębem i nocne odgłosy lasu.' },
      { episode: 'S01E09', action: 'Wielki mecz z bramkami ustawionymi na polanie.' },
      { episode: 'S01E10', action: 'Wielki Piknik Leśnej Szkoły i finałowe wspomnienia sezonu.' },
    ],
  },
  {
    id: 'kaluza',
    name: 'Leśna ścieżka po burzy',
    icon: '💧',
    x: 83,
    y: 67,
    events: [
      { episode: 'S01E06', action: 'Największa Kałuża Świata i budowa mostu dla całej klasy.' },
    ],
  },
  {
    id: 'ogrodek',
    name: 'Szkolny ogródek',
    icon: '🌿',
    x: 17,
    y: 86,
    events: [
      { episode: 'S01E01', action: 'Zwiedzanie szkolnego ogródka i leśnej biblioteki.' },
      { episode: 'S01E08', action: 'Trop świeżego listka prowadzi do rozwiązania zagadki mapy.' },
    ],
  },
  {
    id: 'gniazdo',
    name: 'Stare gniazdo sroki',
    icon: '🪺',
    x: 10,
    y: 18,
    events: [{ episode: 'S01E08', action: 'W gnieździe odnaleziono zaginioną mapę wyprawy.' }],
  },
  {
    id: 'boisko',
    name: 'Leśne boisko',
    icon: '⚽',
    x: 46,
    y: 28,
    events: [
      { episode: 'S01E09', action: 'Wspólna gra zespołowa i gol Jeżyka Julka.' },
      { episode: 'S01E10', action: 'Wspomnienia meczu podczas przygotowań do pikniku.' },
    ],
  },
];
