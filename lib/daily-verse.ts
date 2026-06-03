export interface DailyVerse {
  ref:     string;
  text:    string;
  slug:    string;
  chapter: number;
  verse:   number;
  version: "TB";
}

// 40 ayat terkenal sebagai rotasi harian
const VERSES: DailyVerse[] = [
  { ref:"Yohanes 3:16",     slug:"yohanes",    chapter:3,  verse:16, version:"TB", text:"Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal." },
  { ref:"Roma 8:28",        slug:"roma",        chapter:8,  verse:28, version:"TB", text:"Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah." },
  { ref:"Filipi 4:13",      slug:"filipi",      chapter:4,  verse:13, version:"TB", text:"Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku." },
  { ref:"Yeremia 29:11",    slug:"yeremia",     chapter:29, verse:11, version:"TB", text:"Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman Tuhan, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan." },
  { ref:"Mazmur 23:1",      slug:"mazmur",      chapter:23, verse:1,  version:"TB", text:"Tuhan adalah gembalaku, takkan kekurangan aku." },
  { ref:"Yesaya 40:31",     slug:"yesaya",      chapter:40, verse:31, version:"TB", text:"Tetapi orang-orang yang menanti-nantikan Tuhan mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah." },
  { ref:"Yosua 1:9",        slug:"yosua",       chapter:1,  verse:9,  version:"TB", text:"Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab Tuhan, Allahmu, menyertai engkau, ke manapun engkau pergi." },
  { ref:"Matius 6:33",      slug:"matius",      chapter:6,  verse:33, version:"TB", text:"Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu." },
  { ref:"Mazmur 46:2",      slug:"mazmur",      chapter:46, verse:2,  version:"TB", text:"Allah itu bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti." },
  { ref:"Yohanes 14:6",     slug:"yohanes",     chapter:14, verse:6,  version:"TB", text:"Kata Yesus kepadanya: 'Akulah jalan dan kebenaran dan hidup. Tidak ada seorangpun yang datang kepada Bapa, kalau tidak melalui Aku.'" },
  { ref:"Matius 11:28",     slug:"matius",      chapter:11, verse:28, version:"TB", text:"Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu." },
  { ref:"1 Petrus 5:7",     slug:"1-petrus",    chapter:5,  verse:7,  version:"TB", text:"Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu." },
  { ref:"Ibrani 11:1",      slug:"ibrani",      chapter:11, verse:1,  version:"TB", text:"Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat." },
  { ref:"Amsal 3:5",        slug:"amsal",       chapter:3,  verse:5,  version:"TB", text:"Percayalah kepada Tuhan dengan segenap hatimu dan janganlah bersandar kepada pengertianmu sendiri." },
  { ref:"Roma 12:2",        slug:"roma",        chapter:12, verse:2,  version:"TB", text:"Janganlah kamu menjadi serupa dengan dunia ini, tetapi berubahlah oleh pembaharuan budimu, sehingga kamu dapat membedakan manakah kehendak Allah: apa yang baik, yang berkenan kepada Allah dan yang sempurna." },
  { ref:"Efesus 2:8",       slug:"efesus",      chapter:2,  verse:8,  version:"TB", text:"Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah." },
  { ref:"Yohanes 8:32",     slug:"yohanes",     chapter:8,  verse:32, version:"TB", text:"Dan kamu akan mengetahui kebenaran, dan kebenaran itu akan memerdekakan kamu." },
  { ref:"Roma 3:23",        slug:"roma",        chapter:3,  verse:23, version:"TB", text:"Karena semua orang telah berbuat dosa dan telah kehilangan kemuliaan Allah." },
  { ref:"2 Korintus 5:17",  slug:"2-korintus",  chapter:5,  verse:17, version:"TB", text:"Jadi siapa yang ada di dalam Kristus, ia adalah ciptaan baru: yang lama sudah berlalu, sesungguhnya yang baru sudah datang." },
  { ref:"Filipi 4:6",       slug:"filipi",      chapter:4,  verse:6,  version:"TB", text:"Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur." },
  { ref:"1 Yohanes 4:8",    slug:"1-yohanes",   chapter:4,  verse:8,  version:"TB", text:"Barangsiapa tidak mengasihi, ia tidak mengenal Allah, sebab Allah adalah kasih." },
  { ref:"Mazmur 119:105",   slug:"mazmur",      chapter:119,verse:105, version:"TB", text:"Firman-Mu adalah pelita bagi kakiku dan terang bagi jalanku." },
  { ref:"Yesaya 41:10",     slug:"yesaya",      chapter:41, verse:10, version:"TB", text:"Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Ku yang membawa kemenangan." },
  { ref:"Yohanes 10:10",    slug:"yohanes",     chapter:10, verse:10, version:"TB", text:"Pencuri datang hanya untuk mencuri dan membunuh dan membinasakan; Aku datang, supaya mereka mempunyai hidup, dan mempunyainya dalam segala kelimpahan." },
  { ref:"Roma 5:8",         slug:"roma",        chapter:5,  verse:8,  version:"TB", text:"Akan tetapi Allah menunjukkan kasih-Nya kepada kita, oleh karena Kristus telah mati untuk kita, ketika kita masih berdosa." },
  { ref:"2 Korintus 12:9",  slug:"2-korintus",  chapter:12, verse:9,  version:"TB", text:"Tetapi jawab Tuhan kepadaku: 'Cukuplah kasih karunia-Ku bagimu, sebab justru dalam kelemahanlah kuasa-Ku menjadi sempurna.' Sebab itu terlebih suka aku bermegah atas kelemahanku, supaya kuasa Kristus turun menaungi aku." },
  { ref:"Filipi 4:19",      slug:"filipi",      chapter:4,  verse:19, version:"TB", text:"Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus." },
  { ref:"Kolose 3:23",      slug:"kolose",      chapter:3,  verse:23, version:"TB", text:"Apapun juga yang kamu perbuat, perbuatlah dengan segenap hatimu seperti untuk Tuhan dan bukan untuk manusia." },
  { ref:"Ibrani 13:8",      slug:"ibrani",      chapter:13, verse:8,  version:"TB", text:"Yesus Kristus tetap sama, baik kemarin maupun hari ini dan sampai selama-lamanya." },
  { ref:"Mazmur 27:1",      slug:"mazmur",      chapter:27, verse:1,  version:"TB", text:"Tuhan adalah terangku dan keselamatanku, kepada siapakah aku harus takut? Tuhan adalah benteng hidupku, terhadap siapakah aku harus gemetar?" },
  { ref:"Galatia 5:22",     slug:"galatia",     chapter:5,  verse:22, version:"TB", text:"Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri." },
  { ref:"Matius 5:9",       slug:"matius",      chapter:5,  verse:9,  version:"TB", text:"Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah." },
  { ref:"Roma 6:23",        slug:"roma",        chapter:6,  verse:23, version:"TB", text:"Sebab upah dosa ialah maut; tetapi karunia Allah ialah hidup yang kekal dalam Kristus Yesus, Tuhan kita." },
  { ref:"Efesus 6:10",      slug:"efesus",      chapter:6,  verse:10, version:"TB", text:"Akhirnya, hendaklah kamu kuat di dalam Tuhan, di dalam kekuatan kuasa-Nya." },
  { ref:"Matius 28:20",     slug:"matius",      chapter:28, verse:20, version:"TB", text:"Dan ketahuilah, Aku menyertai kamu senantiasa sampai kepada akhir zaman." },
  { ref:"Galatia 2:20",     slug:"galatia",     chapter:2,  verse:20, version:"TB", text:"Namun aku hidup, tetapi bukan lagi aku sendiri yang hidup, melainkan Kristus yang hidup di dalam aku." },
  { ref:"2 Timotius 3:16",  slug:"2-timotius",  chapter:3,  verse:16, version:"TB", text:"Segala tulisan yang diilhamkan Allah memang bermanfaat untuk mengajar, untuk menyatakan kesalahan, untuk memperbaiki kelakuan dan untuk mendidik orang dalam kebenaran." },
  { ref:"Amsal 3:6",        slug:"amsal",       chapter:3,  verse:6,  version:"TB", text:"Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu." },
  { ref:"Mazmur 37:4",      slug:"mazmur",      chapter:37, verse:4,  version:"TB", text:"Bergembiralah karena Tuhan; maka Ia akan memberikan kepadamu apa yang diinginkan hatimu." },
  { ref:"Yohanes 15:13",    slug:"yohanes",     chapter:15, verse:13, version:"TB", text:"Tidak ada kasih yang lebih besar dari pada kasih seorang yang memberikan nyawanya untuk sahabat-sahabatnya." },
];

/** Ayat untuk hari ini (rotasi berdasarkan tanggal) */
export function getDailyVerse(): DailyVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff  = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return VERSES[dayOfYear % VERSES.length];
}
