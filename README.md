# Alkitab GKPB

PWA Alkitab Bahasa Indonesia — TB, BIS, TL. Offline-capable.

## Setup

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
npm start
```

Deploy ke Vercel: `vercel --prod`

## Struktur data

```
public/bible/
├── TB/          ← Terjemahan Baru
│   ├── index.json         # Daftar 66 kitab + metadata
│   ├── 01-kejadian.json   # Data per kitab
│   └── ...
├── BIS/         ← Bahasa Indonesia Sehari-hari
└── TL/          ← Terjemahan Lama
```

Format per kitab:
```json
{
  "bnumber": 1,
  "name": "Kejadian",
  "chapters": [
    ["Pada mulanya...", "Bumi belum..."],  // pasal 1
    [...]                                  // pasal 2, dst
  ]
}
```

## URL Scheme

```
/{version}/{book-slug}/{chapter}
TB/kejadian/1   → Kejadian pasal 1 (TB)
BIS/yohanes/3   → Yohanes pasal 3 (BIS)
```

## Integrasi dengan Puji dan Janji

Di `puja` app, update konstanta:
```ts
// app/pujidanjanji/page.tsx & app/janjihidup/page.tsx
const BIBLE_APP_URL = "https://domain-alkitab-kamu.vercel.app";
```

Link deep ke pasal spesifik:
```ts
const link = `${BIBLE_APP_URL}/TB/${slug}/${chapter}`;
```

## Env

```env
NEXT_PUBLIC_APP_URL=https://domain-alkitab-kamu.vercel.app
```

## Swap ke LAI API (nanti)

Data layer ada di `lib/bible.ts`. Fungsi `getBook()` dan `getChapter()`
bisa diganti fetch ke API tanpa ubah komponen manapun.
