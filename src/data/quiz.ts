export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export type EpisodeQuiz = {
  episodeCode: string;
  questions: QuizQuestion[];
};

export const season1Quizzes: EpisodeQuiz[] = [
  {
    episodeCode: 'S01E01',
    questions: [
      {
        id: 'S01E01-Q1',
        question: 'Gdzie miesci sie Lesna Szkola?',
        options: ['Pod Wielkim Debem', 'Na Polanie Odkrywcow', 'Nad rzeka'],
        correctIndex: 0,
      },
      {
        id: 'S01E01-Q2',
        question: 'Kim jest Bruno?',
        options: ['Bobrem', 'Jezykiem', 'Lisem'],
        correctIndex: 0,
      },
      {
        id: 'S01E01-Q3',
        question: 'Jaki to byl dzien dla bohaterow?',
        options: ['Pierwszy dzien szkoly', 'Dzien meczu', 'Dzien pikniku'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E02',
    questions: [
      {
        id: 'S01E02-Q1',
        question: 'Jaki konkurs ogloszono w szkole?',
        options: ['Wielki Wyscig do Dzwonka', 'Konkurs spiewu', 'Turniej szachowy'],
        correctIndex: 0,
      },
      {
        id: 'S01E02-Q2',
        question: 'Co chce udowodnic Fela?',
        options: ['Ze jest najszybsza', 'Ze najlepiej rysuje', 'Ze najlepiej gotuje'],
        correctIndex: 0,
      },
      {
        id: 'S01E02-Q3',
        question: 'Jaka wartosc pojawia sie w odcinku?',
        options: ['Pokora i przyjazn', 'Spryt i oszustwo', 'Rywalizacja za wszelka cene'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E03',
    questions: [
      {
        id: 'S01E03-Q1',
        question: 'Dla kogo budowany jest domek?',
        options: ['Dla Jezyka Julka', 'Dla Sowy', 'Dla Bruna'],
        correctIndex: 0,
      },
      {
        id: 'S01E03-Q2',
        question: 'Jak Bruno podchodzi do zadania?',
        options: ['Najpierw planuje', 'Ignoruje zadanie', 'Uciekal z klasy'],
        correctIndex: 0,
      },
      {
        id: 'S01E03-Q3',
        question: 'Jakie przeslanie ma odcinek?',
        options: ['Wspolpraca daje najlepszy efekt', 'Trzeba pracowac samemu', 'Najwazniejsza jest predkosc'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E04',
    questions: [
      {
        id: 'S01E04-Q1',
        question: 'Jaki sprawdzian czeka klase?',
        options: ['Klasowka z szyszek', 'Test z matematyki', 'Dyktando'],
        correctIndex: 0,
      },
      {
        id: 'S01E04-Q2',
        question: 'Kto bardziej sie stresuje?',
        options: ['Fela', 'Bruno', 'Pani Sowa'],
        correctIndex: 0,
      },
      {
        id: 'S01E04-Q3',
        question: 'Co pomaga Feli?',
        options: ['Wspolna nauka i wsparcie', 'Sciaga', 'Brak nauki'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E05',
    questions: [
      {
        id: 'S01E05-Q1',
        question: 'Jakie wydarzenie odbywa sie wieczorem?',
        options: ['Nocowanie pod Wielkim Debem', 'Turniej pilki', 'Lekcja plywania'],
        correctIndex: 0,
      },
      {
        id: 'S01E05-Q2',
        question: 'Co zmienia sie po zmroku?',
        options: ['Las brzmi inaczej i tajemniczo', 'Wszystko znika', 'Nic sie nie zmienia'],
        correctIndex: 0,
      },
      {
        id: 'S01E05-Q3',
        question: 'Co oznacza odwaga w tym odcinku?',
        options: ['Dzialanie mimo strachu', 'Brak jakiegokolwiek strachu', 'Unikanie innych'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E06',
    questions: [
      {
        id: 'S01E06-Q1',
        question: 'Co pojawia sie po burzy na sciezce?',
        options: ['Ogromna kaluza', 'Nowa szkola', 'Most z kamienia'],
        correctIndex: 0,
      },
      {
        id: 'S01E06-Q2',
        question: 'Jak reaguje Bruno?',
        options: ['Mierzy i planuje', 'Od razu skacze bez namyslu', 'Wraca do domu'],
        correctIndex: 0,
      },
      {
        id: 'S01E06-Q3',
        question: 'Jaka lekcja plynie z historii?',
        options: ['Nie warto ryzykowac tylko dla popisu', 'Trzeba zawsze wygrywac', 'Wazne sa tylko rekordy'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E07',
    questions: [
      {
        id: 'S01E07-Q1',
        question: 'Jakie wyzwanie ogloszono?',
        options: ['Dzien Zamiany Talentow', 'Dzien bez zabawy', 'Dzien bez przerwy'],
        correctIndex: 0,
      },
      {
        id: 'S01E07-Q2',
        question: 'Co probuje robic Fela?',
        options: ['Byc uporzadkowana jak Bruno', 'Byc szybsza od wiatru', 'Udawac nauczycielke'],
        correctIndex: 0,
      },
      {
        id: 'S01E07-Q3',
        question: 'Glowna mysl odcinka to:',
        options: ['Kazdy ma wlasne talenty', 'Wszyscy musza byc tacy sami', 'Tylko zwyciezcy sa wazni'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E08',
    questions: [
      {
        id: 'S01E08-Q1',
        question: 'Co znika z klasy?',
        options: ['Mapa wyprawy', 'Dzwonek', 'Tablica'],
        correctIndex: 0,
      },
      {
        id: 'S01E08-Q2',
        question: 'Jak bohaterowie rozwiazuja zagadke?',
        options: ['Lacza tropy i wspolpracuja', 'Kloca sie i poddaja', 'Rzucaja moneta'],
        correctIndex: 0,
      },
      {
        id: 'S01E08-Q3',
        question: 'Gdzie odnaleziono mape?',
        options: ['W starym gniezdzie sroki', 'Pod lawka', 'Na boisku'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E09',
    questions: [
      {
        id: 'S01E09-Q1',
        question: 'Jakie wydarzenie odbywa sie w lesie?',
        options: ['Wielki Mecz Lasu', 'Rajd rowerowy', 'Bal przebierancow'],
        correctIndex: 0,
      },
      {
        id: 'S01E09-Q2',
        question: 'O czym marzy Fela?',
        options: ['O strzeleniu zwycieskiego gola', 'O lataniu', 'O nowym plecaku'],
        correctIndex: 0,
      },
      {
        id: 'S01E09-Q3',
        question: 'Co okazuje sie najwazniejsze?',
        options: ['Wspolpraca druzyny', 'Indywidualny rekord', 'Sama taktyka'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S01E10',
    questions: [
      {
        id: 'S01E10-Q1',
        question: 'Jakie wydarzenie zamyka sezon?',
        options: ['Wielki Piknik Lesnej Szkoly', 'Wyscig z przeszkodami', 'Nocna gra terenowa'],
        correctIndex: 0,
      },
      {
        id: 'S01E10-Q2',
        question: 'Co robia Bruno i Fela podczas przygotowan?',
        options: ['Wspominaja przygody i pomagaja', 'Ignoruja innych', 'Uciekaja z polany'],
        correctIndex: 0,
      },
      {
        id: 'S01E10-Q3',
        question: 'Jakie przeslanie ma final?',
        options: ['Przyjazn i wspolpraca pokonuja chaos', 'Kazdy dba tylko o siebie', 'Liczy sie tylko plan Bruna'],
        correctIndex: 0,
      },
    ],
  },
];

export const season2Quizzes: EpisodeQuiz[] = [
  {
    episodeCode: 'S02E01',
    questions: [
      {
        id: 'S02E01-Q1',
        question: 'Co Bruno napisal zaraz po zakonczeniu roku szkolnego?',
        options: ['Liste Wakacyjnych Przygod', 'List do Pani Sowy', 'Wiersz o wakacjach'],
        correctIndex: 0,
      },
      {
        id: 'S02E01-Q2',
        question: 'Kto zrobil trzy fikołki z radosci na poczatku wakacji?',
        options: ['Lisek Leon', 'Bruno', 'Jezyk Julek'],
        correctIndex: 0,
      },
      {
        id: 'S02E01-Q3',
        question: 'Co powiedzial Pani Sowa uczniom na zakonczenie roku?',
        options: ['Najpiekniejsze wspomnienia tworzy sie razem', 'Uczcie sie cale wakacje', 'Wracajcie wczesnie'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E02',
    questions: [
      {
        id: 'S02E02-Q1',
        question: 'Co zgubila Fela podczas pierwszych dwoch dni wakacji?',
        options: ['Jedna skarpetke', 'Swoj notes', 'Ulubiony szalik'],
        correctIndex: 0,
      },
      {
        id: 'S02E02-Q2',
        question: 'Co Bruno wzial ze soba w torbie pod Wielki Dab?',
        options: ['Lupe, sznurek, notes i kanapki', 'Mape i latarnie', 'Kredki i papier'],
        correctIndex: 0,
      },
      {
        id: 'S02E02-Q3',
        question: 'Co odkryli Bruno i Fela na poczatku wakacyjnych przygod?',
        options: ['Tajemniczy fragment mapy', 'Skarb pelny zlota', 'Stary zamek w lesie'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E03',
    questions: [
      {
        id: 'S02E03-Q1',
        question: 'Gdzie zaprowadzila Bruna i Fele wskazowka z tajemniczej mapy?',
        options: ['Do Wodospadu Siedmiu Kropel', 'Na polane odkrywcow', 'Do starego zamku'],
        correctIndex: 0,
      },
      {
        id: 'S02E03-Q2',
        question: 'Ile razy Fela obeszla wodospad zanim znalezli wskazowke?',
        options: ['Trzy razy', 'Raz', 'Piec razy'],
        correctIndex: 0,
      },
      {
        id: 'S02E03-Q3',
        question: 'Czego musial nauczyc sie Fela przy wodospadzie?',
        options: ['Cierpliwosci', 'Plywania', 'Spokojnego oddychania'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E04',
    questions: [
      {
        id: 'S02E04-Q1',
        question: 'Co zbudowali Bruno i Fela, zeby wyruszyc w rejs po strumyku?',
        options: ['Tratwe', 'Lodke', 'Most'],
        correctIndex: 0,
      },
      {
        id: 'S02E04-Q2',
        question: 'Co znalezli Bruno i Fela podczas rejsu tratwa?',
        options: ['Buteleczke z nowa wskazowka', 'Skarb', 'Stara mape skarbow'],
        correctIndex: 0,
      },
      {
        id: 'S02E04-Q3',
        question: 'Jaka lekcje przyniosla wyprawa tratwa?',
        options: [
          'Nieoczekiwane przeszkody moga prowadzic do czegos dobrego',
          'Zawsze trzeba miec dokladny plan',
          'Lepiej plywac samemu',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E05',
    questions: [
      {
        id: 'S02E05-Q1',
        question: 'Na jakie wyzwanie zdecydowali sie Bruno i Fela w tym odcinku?',
        options: ['Caly dzien bez mowienia ani slowa', 'Dzien bez jedzenia', 'Dzien bez biegania'],
        correctIndex: 0,
      },
      {
        id: 'S02E05-Q2',
        question: 'Za pomoca czego komunikowali sie Bruno i Fela w Dniu Bez Slow?',
        options: ['Gestow i uwaznosci', 'Rysunkow', 'Pukania w drzewo'],
        correctIndex: 0,
      },
      {
        id: 'S02E05-Q3',
        question: 'Co odkryli dzieki Dniowi Bez Slow?',
        options: [
          'Mozna powiedziec duzo nie mowiac nic',
          'Milczenie jest zawsze zle',
          'Mowienie jest o wiele latwiejsze',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E06',
    questions: [
      {
        id: 'S02E06-Q1',
        question: 'Co tajemniczo zniklo podczas lesnego pikniku?',
        options: ['Koszyk z kanapkami', 'Mapa przygod', 'Buteleczka ze wskazowka'],
        correctIndex: 0,
      },
      {
        id: 'S02E06-Q2',
        question: 'Dokad prowadzila wskazowka znaleziona podczas pikniku?',
        options: ['Do starego wiatraka', 'Do wodospadu', 'Do jaskini'],
        correctIndex: 0,
      },
      {
        id: 'S02E06-Q3',
        question: 'Jaka lekcje przyniose lesny piknik?',
        options: [
          'Dzielenie sie przynosi najpiekniejsze niespodzianki',
          'Nie zostawiaj jedzenia bez opieki',
          'Pikniki sa niebezpieczne',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E07',
    questions: [
      {
        id: 'S02E07-Q1',
        question: 'Gdzie stal stary wiatrak?',
        options: ['Na niewielkim wzgorzu', 'Nad strumykiem', 'W centrum lasu przy szkole'],
        correctIndex: 0,
      },
      {
        id: 'S02E07-Q2',
        question: 'Co poruszalo kolami starego wiatraka?',
        options: ['Wiatr', 'Woda ze strumienia', 'Silnik'],
        correctIndex: 0,
      },
      {
        id: 'S02E07-Q3',
        question: 'Dzieki czemu Bruno i Fela znalezli kolejna wskazowke przy wiatraku?',
        options: ['Pomogli innym mieszkancom lasu', 'Dlugo szukali', 'Bruno dokladnie zaplanowal'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E08',
    questions: [
      {
        id: 'S02E08-Q1',
        question: 'Jak nazywala sie jaskinia odkryta przez Bruna i Fele?',
        options: ['Jaskinia Echo', 'Jaskinia Ciemnosci', 'Jaskinia Skarbow'],
        correctIndex: 0,
      },
      {
        id: 'S02E08-Q2',
        question: 'Jaka wskazowke znalezli w jaskini?',
        options: [
          'Szukaj tam, gdzie przyjaciele swieca najjasniej',
          'Idz za wschodem slonca',
          'Kopaj glebiej',
        ],
        correctIndex: 0,
      },
      {
        id: 'S02E08-Q3',
        question: 'Czego wymagala zagadka w Jaskini Echo?',
        options: ['Uwaznego sluchania', 'Silnych miesni', 'Szybkiego biegania'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E09',
    questions: [
      {
        id: 'S02E09-Q1',
        question: 'Co zalozyli Bruno i Fela po polaczeniu wszystkich fragmentow mapy?',
        options: ['Klub Odkrywcow Lasu Szumiacych Lisci', 'Wlasna szkole', 'Letni oboz'],
        correctIndex: 0,
      },
      {
        id: 'S02E09-Q2',
        question: 'Co znalazlo sie na polaczonej mapie wakacyjnych przygod?',
        options: ['Tratwa, Wodospad, Piknik, Wiatrak i Jaskinia', 'Tylko Jaskinia', 'Samo jezioro'],
        correctIndex: 0,
      },
      {
        id: 'S02E09-Q3',
        question: 'Co robili czlonkowie nowego Klubu Odkrywcow?',
        options: ['Wspolnie odkrywali swiat i pomagali innym', 'Zbierali skarby', 'Organizowali wyscigi'],
        correctIndex: 0,
      },
    ],
  },
  {
    episodeCode: 'S02E10',
    questions: [
      {
        id: 'S02E10-Q1',
        question: 'Dokad wyruszy towarzystwo szukac ostatecznego skarbu?',
        options: ['Nad jezioro', 'Do starego zamku', 'Na szczyt wzgorza'],
        correctIndex: 0,
      },
      {
        id: 'S02E10-Q2',
        question: 'Czego uzyl Bruno, zeby otworzyc tajemnicza skrzynke?',
        options: ['Srebrnego kluczyka znalezionego przy wiatraku', 'Kamienia', 'Lapy Feli'],
        correctIndex: 0,
      },
      {
        id: 'S02E10-Q3',
        question: 'Co znajdowalo sie w tajemniczej skrzynce?',
        options: ['Wspomnienia i pamiatki z wakacyjnych przygod', 'Stos zlotych monet', 'Magiczne zaklecie'],
        correctIndex: 0,
      },
    ],
  },
];

export const allQuizzes: EpisodeQuiz[] = [...season1Quizzes, ...season2Quizzes];
