export interface ComicPage {
  id: number;
  title: string;
  description: string;
  image?: string; // Base64 data or external URL
  narrativeText?: string; // Story snippet to accompany the page
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'published' | 'coming_soon' | 'draft';
  releaseDate?: string;
  coverImage?: string;
  pdfLink?: string; // Direct link to Canva PDF or Drive
  pages?: ComicPage[];
}

export const defaultChapters: Chapter[] = [
  {
    id: "chapter-1",
    title: "Episodio 1",
    subtitle: "I Gemelli Planck",
    description: "Una scelta, un salto, infinite realtà. La prima parte dello spin-off ufficiale di The Time Warp. JD si ritrova proiettato in una distorsione temporale sconosciuta, dove i paradossi quantistici aprono segreti mai svelati nel romanzo pricipale. Non è necessario aver letto il romanzo originale per iniziare questa avventura!",
    status: "published",
    releaseDate: "Maggio 2026",
    coverImage: "", // We can use a generated cover or a nice SVG gradient placeholder
    pdfLink: "https://www.canva.com", // Placeholder that can be configured by the user
    pages: [
      {
        id: 1,
        title: "Pagina 1",
        description: "Introduzione quantistica ed JD che si lancia nel vuoto di una metropoli al neon.",
        narrativeText: "Con una scelta, un salto, inizia il paradosso. JD si lancia attraverso un portale quantistico che lacera la notte di una metropoli bagnata dalla pioggia acida."
      },
      {
        id: 2,
        title: "Pagina 2",
        description: "Analisi della fisica temporale della zona di caduta.",
        narrativeText: "Le correnti temporali fischiano nei canali di scarico cibernetici. Il contatore di salti pulsa sul polso sinistro, un calore mortale."
      },
      {
        id: 3,
        title: "Pagina 3",
        description: "Nel Distretto di Planck, Heather stringe i denti cercando di contenere i suoi enormi poteri.",
        narrativeText: "Strada sospesa nel Planck District. Heather stringe i denti, gli occhi illuminati di un'energia indaco instabile. 'Non qui... non ora... Ti prego, fermati...'"
      },
      {
        id: 4,
        title: "Pagina 4",
        description: "La Fortezza di Daker, l'arena quantistica e l'ombra allungata di Jonny.",
        narrativeText: "La fortezza di Daker svetta nel cuore della zona industriale. L'Arena Quantica dimostra il suo spaventoso potere. Thorne siede sul trono nell'ombra mentre l'ombra di Jonny si allunga."
      },
      {
        id: 5,
        title: "Pagina 5",
        description: "JD tenta di orientarsi tra i passanti digitali del distretto cibernetico.",
        narrativeText: "Insegne olografiche distorte si riflettono sulle pozzanghere. JD capisce che questa non è la sua linea temporale originale."
      },
      {
        id: 6,
        title: "Pagina 6",
        description: "I droni di pattuglia rilevano la radiazione quantistica estranea.",
        narrativeText: "Un ronzio metallico squarcia l'aria. I droni del distretto segnalano l'anomalia energetica. Bisogna muoversi in fretta."
      },
      {
        id: 7,
        title: "Pagina 7",
        description: "L'incontro furtivo dietro i vicoli del mercato quantistico.",
        narrativeText: "Un'ombra si muove veloce tra le bancarelle di chip usati. È un alleato inaspettato o una nuova minaccia creata dallo strappo temporale?"
      },
      {
        id: 8,
        title: "Pagina 8",
        description: "I Gemelli Planck rivelano la natura del paradosso temporale corrente.",
        narrativeText: "'Ogni salto lascia una cicatrice nel multiverso,' gli dice una voce metallica bipolare. I gemelli non sono due persone, ma lo stesso individuo catturato in una sovrapposizione."
      },
      {
        id: 9,
        title: "Pagina 9",
        description: "La mappa olografica dei nodi di salto compromessi.",
        narrativeText: "La mappa stellare crolla su un singolo distretto. Il network di cunicoli spazio-temporali della Fortezza di Daker si sta surriscaldando."
      },
      {
        id: 10,
        title: "Pagina 10",
        description: "Attacco alle porte della Fortezza dei Gemelli.",
        narrativeText: "Le guardie esterne caricano scudi a fase. JD deve sincronizzare il suo guanto con la frequenza energetica del cancello."
      },
      {
        id: 11,
        title: "Pagina 11",
        description: "Esplosione di energia cinetica e penetrazione del nucleo quantistico.",
        narrativeText: "Un lampo accecante resetta i sensori ottici per tre lunghi millisecondi. Quando la vista ritorna, il corridoio è deserto."
      },
      {
        id: 12,
        title: "Pagina 12",
        description: "La stanza dei server quantistici: dove il tempo è memorizzato.",
        narrativeText: "Milioni di nastri luminescenti fluttuano nel vuoto magnetico. Qui giacciono i ricordi scartati dei mondi che non hanno mai superato la fase di test."
      },
      {
        id: 13,
        title: "Pagina 13",
        description: "Interfaccia mentale: JD si connette al server centrale.",
        narrativeText: "Le dita metalliche si innestano nella console bagnata. Una valanga di dati riscrive la sua memoria a breve termine. Le lacrime diventano cariche di pixel."
      },
      {
        id: 14,
        title: "Pagina 14",
        description: "La trappola si chiude: Thorne appare come ologramma gigante.",
        narrativeText: "'Pensavi davvero che questo salto fosse tuo, JD?' La risata di Thorne risuona nelle ossa. La gravità nella stanza aumenta del 400%."
      },
      {
        id: 15,
        title: "Pagina 15",
        description: "Emily appare in una visione spezzata di codice radioattivo.",
        narrativeText: "Un segnale radio disperato attraversa i monitor della console. Emily è nel portale numero 7, ma la sua firma vitale sta scendendo rapidamente."
      },
      {
        id: 16,
        title: "Pagina 16",
        description: "Il bivio quantistico: salvare Emily o preservare la linea temporale.",
        narrativeText: "I calcolatori indicano due soluzioni escludenti: un collasso locale o una perdita permanente. La mano di JD trema sopra il comando di override."
      },
      {
        id: 17,
        title: "Pagina 17",
        description: "L'ultimo salto di emergenza prima del blocco totale.",
        narrativeText: "Le bobine della Fortezza si fondono in un fiume di rame liquido. Con un urlo silenziato, il guanto quantistico scarica l'energia accumulata in un singolo punto di fuga."
      },
      {
        id: 18,
        title: "Pagina 18",
        description: "Epilogo del primo capitolo, lo strappo si chiude preludendo al prossimo episodio.",
        narrativeText: "Il silenzio ricade sul Planck District. JD riapre gli occhi sul cemento freddo di una nuova terra sconosciuta. Il Capitolo 1 si è concluso, ma i salti mancanti sono appena iniziati."
      }
    ]
  },
  {
    id: "chapter-2",
    title: "Episodio 2",
    subtitle: "L'Alba d'Acciaio",
    description: "JD si risveglia in un'insolita realtà dominata dal vapore e da ingranaggi titanici. Tra le nebbie elettriche di Clockwork City e i vicoli del Quartiere Meccanico, scoprirà l'esistenza di un'insolita versione dello studio 'J.D. Investigazioni Meccaniche'. Ogni realtà lascia addosso frammenti di qualcun altro... e JD sta per pagarne il prezzo.",
    status: "published",
    releaseDate: "Maggio 2026",
    coverImage: "/src/assets/images/ep2_cover_1780030250684.png",
    pages: [
      {
        id: 1,
        title: "La Città degli Ingranaggi",
        description: "Un potente portale quantistico scarica JD sui tralicci metallici di Clockwork City. Tra velivoli misteriosi e lo sguardo attonito di una donna dai capelli rossi, il detective realizza una drammatica evidenza: non è la sua linea temporale ordinaria.",
        narrativeText: "Ogni salto mi porta più lontano... Cos'è questo... Non è la mia linea temporale.",
        image: "/src/assets/images/ep2_page1_1780030272315.png"
      },
      {
        id: 2,
        title: "Il Quartiere Meccanico",
        description: "Tra rotaie sopraelevate e tram fumanti, JD perlustra i vicoli bagnati della città alla ricerca di risposte. Una vecchia bacheca, un'insegna d'ottone e un automa a vapore aprono la strada verso verità destrutturate.",
        narrativeText: "Ogni realtà lascia addosso frammenti di qualcun altro. Questa versione di me...",
        image: "/src/assets/images/ep2_page2_1780030304427.png"
      },
      {
        id: 3,
        title: "Frammenti di Memoria",
        description: "JD entra nello studio del suo alter-ego. Mentre sperimenta dolorose risonanze quantistiche, la misteriosa donna dai capelli rossi riappare dicendo: 'Qualcosa in questa realtà... mi conosce già.'",
        narrativeText: "La memoria non sempre segue le regole del tempo. Qualcosa in questa realtà... mi conosce già.",
        image: "/src/assets/images/ep2_page3_1780031494460.png"
      },
      {
        id: 4,
        title: "Il Caso Penelope",
        description: "Un prestigioso cliente, accompagnato da un maggiordomo meccanico, affida a JD un caso urgente: la scomparsa della figlia Penelope. L'unico indizio è un enigmatico manufatto a forma d'occhio d'ottone.",
        narrativeText: "JD... temevo non tornaste. Mia figlia è scomparsa tre notti fa. Questo è stato trovato nella sua stanza.",
        image: "/src/assets/images/ep2_page4_1780031519431.png"
      },
      {
        id: 5,
        title: "La Chiave d'Ottone",
        description: "Analizzando il misterioso ingranaggio a forma di occhio sotto la lente, JD vi individua dei codici energetici sconosciuti. È il momento di avventurarsi nel cuore sommerso della città d'acciaio.",
        narrativeText: "Simboli quantistici incisi nell'ottone lucido. L'indagine ha inizio tra le caldaie fumanti di Clockwork City.",
        image: "/src/assets/images/ep2_page5_1780031544522.png"
      }
    ]
  },
  {
    id: "chapter-3",
    title: "Episodio 3",
    subtitle: "Rifrazione Temporale",
    description: "In questo episodio conclusivo dello spin-off, le diverse realtà parallele di Emily e JD collidono, svelando lo scontro finale e mettendo l'autore di fronte alla scelta di riscrivere il proprio destino.",
    status: "coming_soon"
  }
];
