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
      { id: 'S01E01-Q1', question: 'Gdzie mieści się Leśna Szkoła?', options: ['Pod Wielkim Dębem', 'Na Polanie Odkrywców', 'Nad rzeką'], correctIndex: 0 },
      { id: 'S01E01-Q2', question: 'Kim jest Bruno?', options: ['Bobrem', 'Jeżykiem', 'Lisem'], correctIndex: 0 },
      { id: 'S01E01-Q3', question: 'Jaki to był dzień dla bohaterów?', options: ['Pierwszy dzień szkoły', 'Dzień meczu', 'Dzień pikniku'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E02',
    questions: [
      { id: 'S01E02-Q1', question: 'Jaki konkurs ogłoszono w szkole?', options: ['Wielki Wyścig do Dzwonka', 'Konkurs śpiewu', 'Turniej szachowy'], correctIndex: 0 },
      { id: 'S01E02-Q2', question: 'Co chce udowodnić Fela?', options: ['Że jest najszybsza', 'Że najlepiej rysuje', 'Że najlepiej gotuje'], correctIndex: 0 },
      { id: 'S01E02-Q3', question: 'Jaka wartość pojawia się w odcinku?', options: ['Pokora i przyjaźń', 'Spryt i oszustwo', 'Rywalizacja za wszelką cenę'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E03',
    questions: [
      { id: 'S01E03-Q1', question: 'Dla kogo budowany jest domek?', options: ['Dla Jeżyka Julka', 'Dla Sowy', 'Dla Bruna'], correctIndex: 0 },
      { id: 'S01E03-Q2', question: 'Jak Bruno podchodzi do zadania?', options: ['Najpierw planuje', 'Ignoruje zadanie', 'Uciekał z klasy'], correctIndex: 0 },
      { id: 'S01E03-Q3', question: 'Jakie przesłanie ma odcinek?', options: ['Współpraca daje najlepszy efekt', 'Trzeba pracować samemu', 'Najważniejsza jest prędkość'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E04',
    questions: [
      { id: 'S01E04-Q1', question: 'Jaki sprawdzian czeka klasę?', options: ['Klasówka z szyszek', 'Test z matematyki', 'Dyktando'], correctIndex: 0 },
      { id: 'S01E04-Q2', question: 'Kto bardziej się stresuje?', options: ['Fela', 'Bruno', 'Pani Sowa'], correctIndex: 0 },
      { id: 'S01E04-Q3', question: 'Co pomaga Feli?', options: ['Wspólna nauka i wsparcie', 'Ściąga', 'Brak nauki'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E05',
    questions: [
      { id: 'S01E05-Q1', question: 'Jakie wydarzenie odbywa się wieczorem?', options: ['Nocowanie pod Wielkim Dębem', 'Turniej piłki', 'Lekcja pływania'], correctIndex: 0 },
      { id: 'S01E05-Q2', question: 'Co zmienia się po zmroku?', options: ['Las brzmi inaczej i tajemniczo', 'Wszystko znika', 'Nic się nie zmienia'], correctIndex: 0 },
      { id: 'S01E05-Q3', question: 'Co oznacza odwaga w tym odcinku?', options: ['Działanie mimo strachu', 'Brak jakiegokolwiek strachu', 'Unikanie innych'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E06',
    questions: [
      { id: 'S01E06-Q1', question: 'Co pojawia się po burzy na ścieżce?', options: ['Ogromna kałuża', 'Nowa szkoła', 'Most z kamienia'], correctIndex: 0 },
      { id: 'S01E06-Q2', question: 'Jak reaguje Bruno?', options: ['Mierzy i planuje', 'Od razu skacze bez namysłu', 'Wraca do domu'], correctIndex: 0 },
      { id: 'S01E06-Q3', question: 'Jaka lekcja płynie z historii?', options: ['Nie warto ryzykować tylko dla popisu', 'Trzeba zawsze wygrywać', 'Ważne są tylko rekordy'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E07',
    questions: [
      { id: 'S01E07-Q1', question: 'Jakie wyzwanie ogłoszono?', options: ['Dzień Zamiany Talentów', 'Dzień bez zabawy', 'Dzień bez przerwy'], correctIndex: 0 },
      { id: 'S01E07-Q2', question: 'Co próbuje robić Fela?', options: ['Być uporzadkowaną jak Bruno', 'Być szybszą od wiatru', 'Udawać nauczycielkę'], correctIndex: 0 },
      { id: 'S01E07-Q3', question: 'Główna myśl odcinka to:', options: ['Każdy ma własne talenty', 'Wszyscy muszą być tacy sami', 'Tylko zwycięzcy są ważni'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E08',
    questions: [
      { id: 'S01E08-Q1', question: 'Co znika z klasy?', options: ['Mapa wyprawy', 'Dzwonek', 'Tablica'], correctIndex: 0 },
      { id: 'S01E08-Q2', question: 'Jak bohaterowie rozwiązują zagadkę?', options: ['Łączą tropy i współpracują', 'Kłócą się i poddają', 'Rzucają monetą'], correctIndex: 0 },
      { id: 'S01E08-Q3', question: 'Gdzie odnaleziono mapę?', options: ['W starym gnieździe sroki', 'Pod ławką', 'Na boisku'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E09',
    questions: [
      { id: 'S01E09-Q1', question: 'Jakie wydarzenie odbywa się w lesie?', options: ['Wielki Mecz Lasu', 'Rajd rowerowy', 'Bal przebierańców'], correctIndex: 0 },
      { id: 'S01E09-Q2', question: 'O czym marzy Fela?', options: ['O strzeleniu zwycięskiego gola', 'O lataniu', 'O nowym plecaku'], correctIndex: 0 },
      { id: 'S01E09-Q3', question: 'Co okazuje się najważniejsze?', options: ['Współpraca drużyny', 'Indywidualny rekord', 'Sama taktyka'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S01E10',
    questions: [
      { id: 'S01E10-Q1', question: 'Jakie wydarzenie zamyka sezon?', options: ['Wielki Piknik Leśnej Szkoły', 'Wyścig z przeszkodami', 'Nocna gra terenowa'], correctIndex: 0 },
      { id: 'S01E10-Q2', question: 'Co robią Bruno i Fela podczas przygotowań?', options: ['Wspominają przygody i pomagają', 'Ignorują innych', 'Uciekają z polany'], correctIndex: 0 },
      { id: 'S01E10-Q3', question: 'Jakie przesłanie ma finał?', options: ['Przyjaźń i współpraca pokonują chaos', 'Każdy dba tylko o siebie', 'Liczy się tylko plan Bruna'], correctIndex: 0 },
    ],
  },
];

export const season2Quizzes: EpisodeQuiz[] = [
  {
    episodeCode: 'S02E01',
    questions: [
      { id: 'S02E01-Q1', question: 'Co Bruno napisał zaraz po zakończeniu roku szkolnego?', options: ['Listę Wakacyjnych Przygod', 'List do Pani Sowy', 'Wiersz o wakacjach'], correctIndex: 0 },
      { id: 'S02E01-Q2', question: 'Kto zrobił trzy fikołki z radości na początku wakacji?', options: ['Lisek Leon', 'Bruno', 'Jeżyk Julek'], correctIndex: 0 },
      { id: 'S02E01-Q3', question: 'Co powiedziała Pani Sowa uczniom na zakończenie roku?', options: ['Najpiękniejsze wspomnienia tworzy się razem', 'Uczcie się całe wakacje', 'Wracajcie wcześniej'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E02',
    questions: [
      { id: 'S02E02-Q1', question: 'Co zgubiła Fela podczas pierwszych dwóch dni wakacji?', options: ['Jedną skarpeć', 'Swój notes', 'Ulubiony szalik'], correctIndex: 0 },
      { id: 'S02E02-Q2', question: 'Co Bruno wziął ze sobą w torbie pod Wielki Dąb?', options: ['Lupę, sznurek, notes i kanapki', 'Mapę i latarnię', 'Kredki i papier'], correctIndex: 0 },
      { id: 'S02E02-Q3', question: 'Co odkryli Bruno i Fela na początku wakacyjnych przygod?', options: ['Tajemniczy fragment mapy', 'Skarb pełny złota', 'Stary zamek w lesie'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E03',
    questions: [
      { id: 'S02E03-Q1', question: 'Gdzie zaproważila Bruna i Felę wskazówka z tajemniczej mapy?', options: ['Do Wodospadu Siedmiu Kropel', 'Na polanę odkrywców', 'Do starego zamku'], correctIndex: 0 },
      { id: 'S02E03-Q2', question: 'Ile razy Fela odeszła wodospad zanim znaleźli wskazówkę?', options: ['Trzy razy', 'Raz', 'Pięć razy'], correctIndex: 0 },
      { id: 'S02E03-Q3', question: 'Czego musiała nauczyć się Fela przy wodospadzie?', options: ['Cierpliwości', 'Pływania', 'Spokojnego oddychania'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E04',
    questions: [
      { id: 'S02E04-Q1', question: 'Co zbudowali Bruno i Fela, żeby wyruszyć w rejs po strumyku?', options: ['Tratwę', 'Łódkę', 'Most'], correctIndex: 0 },
      { id: 'S02E04-Q2', question: 'Co znaleźli Bruno i Fela podczas rejsu tratwą?', options: ['Buteleczkę z nową wskazówką', 'Skarb', 'Starą mapę skarbów'], correctIndex: 0 },
      { id: 'S02E04-Q3', question: 'Jaką lekcję przyniosła wyprawa tratwą?', options: ['Nieoczekiwane przeszkody mogą prowadzić do czegoś dobrego', 'Zawsze trzeba mieć dokładny plan', 'Lepiej pływać samemu'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E05',
    questions: [
      { id: 'S02E05-Q1', question: 'Na jakie wyzwanie zdecydowali się Bruno i Fela w tym odcinku?', options: ['Cały dzień bez mówienia ani słowa', 'Dzień bez jedzenia', 'Dzień bez biegania'], correctIndex: 0 },
      { id: 'S02E05-Q2', question: 'Za pomocą czego komunikowali się Bruno i Fela w Dniu Bez Słów?', options: ['Gestów i uważności', 'Rysunków', 'Pukania w drzewo'], correctIndex: 0 },
      { id: 'S02E05-Q3', question: 'Co odkryli dzięki Dniowi Bez Słów?', options: ['Można powiedzieć dużo nie mówiąc nic', 'Milczenie jest zawsze złe', 'Mówienie jest o wiele łatwiejsze'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E06',
    questions: [
      { id: 'S02E06-Q1', question: 'Co tajemniczo zniknęło podczas leśnego pikniku?', options: ['Koszyk z kanapkami', 'Mapa przygod', 'Buteleczka ze wskazówką'], correctIndex: 0 },
      { id: 'S02E06-Q2', question: 'Dokąd prowadziła wskazówka znaleziona podczas pikniku?', options: ['Do starego wiatraka', 'Do wodospadu', 'Do jaskini'], correctIndex: 0 },
      { id: 'S02E06-Q3', question: 'Jaką lekcję przyniesie leśny piknik?', options: ['Dzielenie się przynosi najpiękniejsze niespodzianki', 'Nie zostawiaj jedzenia bez opieki', 'Pikniki są niebezpieczne'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E07',
    questions: [
      { id: 'S02E07-Q1', question: 'Gdzie stał stary wiatrak?', options: ['Na niewielkim wzgórzu', 'Nad strumykiem', 'W centrum lasu przy szkole'], correctIndex: 0 },
      { id: 'S02E07-Q2', question: 'Co poruszało kołami starego wiatraka?', options: ['Wiatr', 'Woda ze strumienia', 'Silnik'], correctIndex: 0 },
      { id: 'S02E07-Q3', question: 'Dzięki czemu Bruno i Fela znaleźli kolejną wskazówkę przy wiatraku?', options: ['Pomogli innym mieszkańcom lasu', 'Długo szukali', 'Bruno dokładnie zaplanował'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E08',
    questions: [
      { id: 'S02E08-Q1', question: 'Jak nazywała się jaskinia odkryta przez Bruna i Felę?', options: ['Jaskinia Echo', 'Jaskinia Ciemności', 'Jaskinia Skarbów'], correctIndex: 0 },
      { id: 'S02E08-Q2', question: 'Jaką wskazówkę znaleźli w jaskini?', options: ['Szukaj tam, gdzie przyjaciele świecą najjaśniej', 'Idź za wschodem słońca', 'Kopaj głębiej'], correctIndex: 0 },
      { id: 'S02E08-Q3', question: 'Czego wymagała zagadka w Jaskini Echo?', options: ['Uważnego słuchania', 'Silnych mięśni', 'Szybkiego biegania'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E09',
    questions: [
      { id: 'S02E09-Q1', question: 'Co założyli Bruno i Fela po połączeniu wszystkich fragmentów mapy?', options: ['Klub Odkrywców Lasu Szumiących Liści', 'Własną szkołę', 'Letni obóz'], correctIndex: 0 },
      { id: 'S02E09-Q2', question: 'Co znalazło się na połączonej mapie wakacyjnych przygod?', options: ['Tratwa, Wodospad, Piknik, Wiatrak i Jaskinia', 'Tylko Jaskinia', 'Samo jezioro'], correctIndex: 0 },
      { id: 'S02E09-Q3', question: 'Co robili członkowie nowego Klubu Odkrywców?', options: ['Wspólnie odkrywali świat i pomagali innym', 'Zbierali skarby', 'Organizowali wyścigi'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S02E10',
    questions: [
      { id: 'S02E10-Q1', question: 'Dokąd wyruszy towarzystwo szukać ostatecznego skarbu?', options: ['Nad jezioro', 'Do starego zamku', 'Na szczyt wzgórza'], correctIndex: 0 },
      { id: 'S02E10-Q2', question: 'Czego użył Bruno, żeby otworzyć tajemniczą skrzynkę?', options: ['Srebrnego kluczyka znalezionego przy wiatraku', 'Kamienia', 'Łapy Feli'], correctIndex: 0 },
      { id: 'S02E10-Q3', question: 'Co znajdowało się w tajemniczej skrzynce?', options: ['Wspomnienia i pamiątki z wakacyjnych przygod', 'Stos złotych monet', 'Magiczne zaklęcie'], correctIndex: 0 },
    ],
  },
];

export const season3Quizzes: EpisodeQuiz[] = [
  {
    episodeCode: 'S03E01',
    questions: [
      { id: 'S03E01-Q1', question: 'Dokąd wracają Bruno i Fela po wakacjach?', options: ['Do Leśnej Szkoły', 'Do starego wiatraka', 'Nad wodospad'], correctIndex: 0 },
      { id: 'S03E01-Q2', question: 'Co znajdują Bruno i Fela?', options: ['Niezwykły jesienny liść', 'Zaginioną książkę', 'Tajemniczą skrzynkę'], correctIndex: 0 },
      { id: 'S03E01-Q3', question: 'Co znajduje się na znalezionym liściu?', options: ['Tajemniczy symbol', 'Mapa wakacji', 'Rysunek szkoły'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E02',
    questions: [
      { id: 'S03E02-Q1', question: 'Kogo ślady znaleźli Bruno i Fela w błocie?', options: ['Borsuka', 'Sójki', 'Julka'], correctIndex: 0 },
      { id: 'S03E02-Q2', question: 'Co było narysowane na znalezionym kawałku papieru?', options: ['Liść i jedna kreska', 'Mapa z drogą', 'Wielki Dąb'], correctIndex: 0 },
      { id: 'S03E02-Q3', question: 'Jaki symbol był wyryty na kamieniu?', options: ['Księżyc', 'Słońce', 'Gwiazda'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E03',
    questions: [
      { id: 'S03E03-Q1', question: 'Gdzie odbywał się Jesienny Wyścig Liści?', options: ['Przy strumyku', 'Pod Wielkim Dębem', 'W Jaskini Echo'], correctIndex: 0 },
      { id: 'S03E03-Q2', question: 'Jaki kolor miał liść wybrany przez Felę?', options: ['Pomarańczowy', 'Czerwony', 'Zielony'], correctIndex: 0 },
      { id: 'S03E03-Q3', question: 'Co znaleźli pod liściem Feli?', options: ['Mały drewniany listek', 'Kamień z księżycem', 'Piórko sójki'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E04',
    questions: [
      { id: 'S03E04-Q1', question: 'Czyj domek zniknął przy strumyku?', options: ['Julka', 'Leona', 'Miko'], correctIndex: 0 },
      { id: 'S03E04-Q2', question: 'Dlaczego przyjaciele przenieśli domek?', options: ['W starym miejscu zbierała się woda', 'Chcieli go ukryć', 'Domek był za mały'], correctIndex: 0 },
      { id: 'S03E04-Q3', question: 'Co nowego miał domek Julka?', options: ['Okienko i lepszy dach', 'Wieżę i balkon', 'Most nad strumykiem'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E05',
    questions: [
      { id: 'S03E05-Q1', question: 'Dokąd zaprowadziły Bruna i Felę światełka?', options: ['Do Jaskini Echo', 'Do Leśnej Szkoły', 'Do starego wiatraka'], correctIndex: 0 },
      { id: 'S03E05-Q2', question: 'Co rozświetliło ścianę jaskini?', options: ['Setki świetlików', 'Latarnie Bruna', 'Blask księżyca'], correctIndex: 0 },
      { id: 'S03E05-Q3', question: 'Co było napisane na kamieniu w jaskini?', options: ['Nie wszystko, co świeci, pokazuje drogę', 'Idź zawsze za światłem', 'Najpierw znajdź skarb'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E06',
    questions: [
      { id: 'S03E06-Q1', question: 'Co zaczęło padać podczas jesiennego pikniku?', options: ['Deszcz', 'Śnieg', 'Liście'], correctIndex: 0 },
      { id: 'S03E06-Q2', question: 'Gdzie przyjaciele przenieśli piknik?', options: ['Pod Wielki Dąb', 'Do Jaskini Echo', 'Do domku Julka'], correctIndex: 0 },
      { id: 'S03E06-Q3', question: 'Jakie zdanie znaleziono na liściu?', options: ['Kiedy wiatr zmienia kierunek, zmień się razem z nim', 'Każdy piknik musi być w słońcu', 'Nie ufaj jesiennym liściom'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E07',
    questions: [
      { id: 'S03E07-Q1', question: 'Co znalazła Fela pod liściem przyniesionym przez wiatr?', options: ['Mały kawałek papieru', 'Złoty kluczyk', 'Kamień z symbolem'], correctIndex: 0 },
      { id: 'S03E07-Q2', question: 'Co pojawiło się na pustej stronie po położeniu pierwszego liścia?', options: ['Historia dawnych Odkrywców', 'Mapa skarbu', 'Rysunek wiatraka'], correctIndex: 0 },
      { id: 'S03E07-Q3', question: 'Co mieli zrobić kolejni Odkrywcy według księgi?', options: ['Dopisać swoją historię', 'Znaleźć złoty skarb', 'Zbudować nową szkołę'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E08',
    questions: [
      { id: 'S03E08-Q1', question: 'Gdzie Bruno i Fela znaleźli skrzynkę?', options: ['Między korzeniami Wielkiego Dębu', 'Przy starym wiatraku', 'Pod mostkiem'], correctIndex: 0 },
      { id: 'S03E08-Q2', question: 'O czym mówiły listy dawnych Odkrywców?', options: ['O odwadze, przyjaźni i pomaganiu', 'O ukrytym złocie', 'O wyścigach w lesie'], correctIndex: 0 },
      { id: 'S03E08-Q3', question: 'Co było napisane na pustej kopercie?', options: ['Dla kolejnych odkrywców', 'Nie otwierać', 'Tylko dla Bruna'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E09',
    questions: [
      { id: 'S03E09-Q1', question: 'Ile symboli Bruno zauważył na okładce księgi?', options: ['Cztery', 'Dwa', 'Siedem'], correctIndex: 0 },
      { id: 'S03E09-Q2', question: 'Co przedstawiał rysunek, który pojawił się w księdze?', options: ['Polanę, Wielki Dąb i Klub Odkrywców', 'Jaskinię Echo i wiatrak', 'Leśną Szkołę i strumyk'], correctIndex: 0 },
      { id: 'S03E09-Q3', question: 'Jaki nowy symbol pojawił się na końcu?', options: ['Mała śnieżynka', 'Czerwony liść', 'Srebrny klucz'], correctIndex: 0 },
    ],
  },
  {
    episodeCode: 'S03E10',
    questions: [
      { id: 'S03E10-Q1', question: 'Od czego zaczęła się jesienna historia Bruna i Feli?', options: ['Od jednego liścia', 'Od pikniku', 'Od pierwszego śniegu'], correctIndex: 0 },
      { id: 'S03E10-Q2', question: 'Co Bruno uznał za najważniejsze odkrycie jesieni?', options: ['Przyjaźń i wspólną historię', 'Skrzynkę pod Dębem', 'Największy liść w lesie'], correctIndex: 0 },
      { id: 'S03E10-Q3', question: 'Co spadło z nieba, gdy skończyli pisać w księdze?', options: ['Pierwszy płatek śniegu', 'Jesienny liść', 'Kropla deszczu'], correctIndex: 0 },
    ],
  },
];

export const allQuizzes: EpisodeQuiz[] = [...season1Quizzes, ...season2Quizzes, ...season3Quizzes];
