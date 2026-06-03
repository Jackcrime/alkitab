import type { Version } from "./bible";

export interface ParsedRef {
  slug:     string;
  bookName: string;
  chapter:  number;
  verse?:   number;
}

// ── Slug helpers ───────────────────────────────────────────────────────────────
// Format slug sama dengan hasil konversi XML: lowercase, spasi → '-'

// Map: alias (lowercase) → [slug, display name]
// Alias lebih panjang harus dicoba duluan (lihat parseReference)
const RAW: [string[], string, string][] = [
  // [aliases, slug, displayName]
  [["kejadian","kej","genesis","gen"],                           "kejadian",        "Kejadian"],
  [["keluaran","kel","exodus","eks"],                            "keluaran",        "Keluaran"],
  [["imamat","im","levitikus","lev"],                           "imamat",          "Imamat"],
  [["bilangan","bil","numeri","num"],                           "bilangan",        "Bilangan"],
  [["ulangan","ul","ulangan","det","deut"],                     "ulangan",         "Ulangan"],
  [["yosua","yos","josua","jos"],                               "yosua",           "Yosua"],
  [["hakim-hakim","hakim","hak","judges"],                      "hakim-hakim",     "Hakim-hakim"],
  [["rut","ruth","rt"],                                         "rut",             "Rut"],
  [["1 samuel","1samuel","1sam","1sa"],                         "1-samuel",        "1 Samuel"],
  [["2 samuel","2samuel","2sam","2sa"],                         "2-samuel",        "2 Samuel"],
  [["1 raja-raja","1 raja","1raja-raja","1raja","1raj","1ki"],  "1-raja-raja",     "1 Raja-raja"],
  [["2 raja-raja","2 raja","2raja-raja","2raja","2raj","2ki"],  "2-raja-raja",     "2 Raja-raja"],
  [["1 tawarikh","1tawarikh","1taw","1chr"],                    "1-tawarikh",      "1 Tawarikh"],
  [["2 tawarikh","2tawarikh","2taw","2chr"],                    "2-tawarikh",      "2 Tawarikh"],
  [["ezra","ezr","ez"],                                         "ezra",            "Ezra"],
  [["nehemia","neh"],                                           "nehemia",         "Nehemia"],
  [["ester","est"],                                             "ester",           "Ester"],
  [["ayub","ayb","job"],                                        "ayub",            "Ayub"],
  [["mazmur","mzm","maz","psa","ps"],                          "mazmur",          "Mazmur"],
  [["amsal","ams","prov","pro"],                                "amsal",           "Amsal"],
  [["pengkhotbah","pkh","qoh","ecc"],                          "pengkhotbah",     "Pengkhotbah"],
  [["kidung agung","kidung","kid","ss","song"],                 "kidung-agung",    "Kidung Agung"],
  [["yesaya","yes","isa"],                                      "yesaya",          "Yesaya"],
  [["yeremia","yer","jer"],                                     "yeremia",         "Yeremia"],
  [["ratapan","rat","lam"],                                     "ratapan",         "Ratapan"],
  [["yehezkiel","yeh","ezk","eze"],                            "yehezkiel",       "Yehezkiel"],
  [["daniel","dan"],                                            "daniel",          "Daniel"],
  [["hosea","hos"],                                             "hosea",           "Hosea"],
  [["yoel","joe"],                                              "yoel",            "Yoel"],
  [["amos","am"],                                               "amos",            "Amos"],
  [["obaja","ob"],                                              "obaja",           "Obaja"],
  [["yunus","yun","jon"],                                       "yunus",           "Yunus"],
  [["mikha","mi","mic"],                                        "mikha",           "Mikha"],
  [["nahum","nah"],                                             "nahum",           "Nahum"],
  [["habakuk","hab"],                                           "habakuk",         "Habakuk"],
  [["zefanya","zef","zep"],                                     "zefanya",         "Zefanya"],
  [["hagai","hag"],                                             "hagai",           "Hagai"],
  [["zakharia","zak","zec"],                                    "zakharia",        "Zakharia"],
  [["maleakhi","mal"],                                          "maleakhi",        "Maleakhi"],
  // ── PB ─────────────────────────────────────────────────────────────────────
  [["matius","mat","mt"],                                       "matius",          "Matius"],
  [["markus","mrk","mark","mk"],                                "markus",          "Markus"],
  [["lukas","luk","lk"],                                        "lukas",           "Lukas"],
  [["yohanes","yoh","joh","jn"],                               "yohanes",         "Yohanes"],
  [["kisah para rasul","kisah rasul","kisah","kis","kpr","act"],"kisah-para-rasul","Kisah Para Rasul"],
  [["roma","rm","rom"],                                         "roma",            "Roma"],
  [["1 korintus","1korintus","1kor","1cor","1ko"],             "1-korintus",      "1 Korintus"],
  [["2 korintus","2korintus","2kor","2cor","2ko"],             "2-korintus",      "2 Korintus"],
  [["galatia","gal"],                                           "galatia",         "Galatia"],
  [["efesus","ef","eph"],                                       "efesus",          "Efesus"],
  [["filipi","flp","php"],                                      "filipi",          "Filipi"],
  [["kolose","kol","col"],                                      "kolose",          "Kolose"],
  [["1 tesalonika","1tesalonika","1tes","1thes"],              "1-tesalonika",    "1 Tesalonika"],
  [["2 tesalonika","2tesalonika","2tes","2thes"],              "2-tesalonika",    "2 Tesalonika"],
  [["1 timotius","1timotius","1tim","1ti"],                    "1-timotius",      "1 Timotius"],
  [["2 timotius","2timotius","2tim","2ti"],                    "2-timotius",      "2 Timotius"],
  [["titus","tit"],                                             "titus",           "Titus"],
  [["filemon","flm","phm"],                                     "filemon",         "Filemon"],
  [["ibrani","ibr","heb"],                                      "ibrani",          "Ibrani"],
  [["yakobus","yak","jas"],                                     "yakobus",         "Yakobus"],
  [["1 petrus","1petrus","1pet","1pe"],                        "1-petrus",        "1 Petrus"],
  [["2 petrus","2petrus","2pet","2pe"],                        "2-petrus",        "2 Petrus"],
  [["1 yohanes","1yohanes","1yoh","1jn"],                     "1-yohanes",       "1 Yohanes"],
  [["2 yohanes","2yohanes","2yoh","2jn"],                     "2-yohanes",       "2 Yohanes"],
  [["3 yohanes","3yohanes","3yoh","3jn"],                     "3-yohanes",       "3 Yohanes"],
  [["yudas","yud","jude"],                                      "yudas",           "Yudas"],
  [["wahyu","why","rev","apk"],                                 "wahyu",           "Wahyu"],
];

// Bangun map flat: alias → { slug, bookName }
type BookEntry = { slug: string; bookName: string };
const ALIAS_MAP = new Map<string, BookEntry>();

for (const [aliases, slug, bookName] of RAW) {
  for (const alias of aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), { slug, bookName });
  }
}

// Sort by alias length DESC agar alias panjang dicoba duluan
// ("kisah para rasul" sebelum "kisah")
const SORTED_ALIASES = Array.from(ALIAS_MAP.keys())
  .sort((a, b) => b.length - a.length);

// ── Parser ─────────────────────────────────────────────────────────────────────

/**
 * Coba parse query sebagai referensi Alkitab.
 * Contoh yang dikenali:
 *   "Yohanes 3:16"      → { slug: "yohanes",  chapter: 3, verse: 16 }
 *   "Kej 1"             → { slug: "kejadian", chapter: 1 }
 *   "1 Kor 13:4-7"      → { slug: "1-korintus", chapter: 13, verse: 4 }
 *   "Mazmur23"          → { slug: "mazmur",   chapter: 23 }
 *   "kasih setia"       → null  (teks biasa)
 */
export function parseReference(query: string): ParsedRef | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  for (const alias of SORTED_ALIASES) {
    // Cocokkan alias di awal query, lalu optional spasi, lalu chapter[:verse]
    if (!q.startsWith(alias)) continue;

    const rest = q.slice(alias.length).trim();
    if (!rest) continue; // alias saja tanpa angka → bukan referensi lengkap

    // rest harus dimulai dengan angka
    const chVerseMatch = rest.match(/^(\d+)(?:\s*[:\s]\s*(\d+))?/);
    if (!chVerseMatch) continue;

    const entry   = ALIAS_MAP.get(alias)!;
    const chapter = parseInt(chVerseMatch[1]);
    const verse   = chVerseMatch[2] ? parseInt(chVerseMatch[2]) : undefined;

    if (isNaN(chapter) || chapter < 1) continue;

    return { slug: entry.slug, bookName: entry.bookName, chapter, verse };
  }

  return null;
}

/** Buat URL dari referensi yang sudah diparsing */
export function refToUrl(ref: ParsedRef, version: Version): string {
  const base = `/${version}/${ref.slug}/${ref.chapter}`;
  return ref.verse ? `${base}#v${ref.verse}` : base;
}

/** Format referensi jadi teks yang enak dibaca */
export function formatRef(ref: ParsedRef, version: Version): string {
  const v = ref.verse ? `:${ref.verse}` : "";
  return `${ref.bookName} ${ref.chapter}${v} (${version})`;
}
