import { toDeterministicUuid } from '../utils'

export const SAMPLE_SERVICES = [
  {
    id: toDeterministicUuid('srv-1'),
    title: 'Xonadon va ofislarda barcha turdagi santexnika montaji va ta\'mirlash',
    category: 'Santexnik',
    city: 'Toshkent',
    price: 350000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    orders_count: 42,
    rating: 5.0,
    reviews_count: 28,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 3).toISOString(),
    description: `Assalomu alaykum! 8 yillik tajribaga ega professional santexnikman. 
Barcha turdagi santexnika xizmatlarini sifatli, toza va kafolat bilan bajarib beraman:
• Yangi quvurlarni yotqizish (plastik, ekoplast, metall)
• Dush kabinasi, vanna va unitaz o'rnatish
• Ariston, suv isitgich va nasoslarni montaj qilish
• Tiqilib qolgan quvurlarni tozalash (zasor ochish)
• Sifatli materiallarni tanlashda maslahat berish.

Ishimga 1 yil to'liq kafolat beraman!`,
    includes: [
      'Joyiga borib diagnostika qilish',
      'Eski uskunalarni ehtiyotkorlik bilan demontaj qilish',
      'Yangi santexnika jihozlarini germetik o\'rnatish',
      'Suv bosimini sinab ko\'rish va tekshirish'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-dilshod-101'),
      full_name: 'Rustam Qosimov',
      specialty: 'Santexnik',
      city: 'Toshkent shahar',
      phone: '+998 90 876 54 32',
      telegram: 'rustam_santexnik',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 8,
      rating: 5.0,
      reviews_count: 28,
      completed_jobs: 42
    }
  },
  {
    id: toDeterministicUuid('srv-2'),
    title: 'Xavfsiz elektr montaj, avtomat shit yig\'ish va lyustralarni o\'rnatish',
    category: 'Elektrik',
    city: 'Toshkent',
    price: 400000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    orders_count: 36,
    rating: 4.9,
    reviews_count: 22,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 5).toISOString(),
    description: `Professional elektr ustasi xizmatlari. Xonadon, novostroyka, kottej va ofislar uchun to'liq elektr loyihalash va montaj:
• Elektr simlarini to'g'ri hisoblab montaj qilish
• Yevro avtomat shit va UZO xavfsizlik tizimlarini yig'ish
• Rozetka, viklyuchatel va datchiklarni o'rnatish
• LED lentalar, qandillar va mebel chiroqlarini ulash
• Qisqa tutashuv (korotkoye zamykaniye)ni topib bartaraf etish.

Barcha ishlar qoidalarga to'liq muvofiq bajariladi.`,
    includes: [
      'Yuklama hisob-kitobi va xavfsizlik tekshiruvi',
      'Lazer yordamida aniq montaj',
      'Kafolatlangan xavfsiz ulanish'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-sherzod-102'),
      full_name: 'Sherzod Aliyev',
      specialty: 'Elektrik',
      city: 'Toshkent (Yunusobod)',
      phone: '+998 93 111 22 33',
      telegram: 'sherzod_elektrik',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 6,
      rating: 4.9,
      reviews_count: 22,
      completed_jobs: 36
    }
  },
  {
    id: toDeterministicUuid('srv-3'),
    title: 'Oshxona mebellari, shkaf-kupe va kravatlarni professional yig\'ish',
    category: 'Duradgor',
    city: 'Samarqand',
    price: 300000,
    duration_days: 2,
    cover_image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    orders_count: 58,
    rating: 5.0,
    reviews_count: 34,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 7).toISOString(),
    description: `Barcha turdagi mebellarni professional asboblar bilan tez va sifatli yig'ib o'rnatib beraman:
• Fabrichnyy va buyurtma asosidagi oshxona garniturlari
• Shkaf-kupe, prixojka va garderob xonalari
• Yotoqxona mebellari, ikki qavatli bolalar kravatlari
• Stoleshnitsani kesish va moykani joylashtirish
• Eskirgan mebel eshiklari va ilmoqlarini sozlash.

Samarqand shahri va atrof tumanlarga tez yetib boraman!`,
    includes: [
      'Chizmalar asosida to\'g\'ri geometriyada yig\'ish',
      'Barcha ilmoq va dovodchiklarni tekislash',
      'Chang va qipiqlarni tozalab topshirish'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-jasur-103'),
      full_name: 'Jasur Saidov',
      specialty: 'Duradgor',
      city: 'Samarqand shahar',
      phone: '+998 94 222 33 44',
      telegram: 'jasur_duradgor',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 10,
      rating: 5.0,
      reviews_count: 34,
      completed_jobs: 58
    }
  },
  {
    id: toDeterministicUuid('srv-4'),
    title: 'Devorlarga sifatli kafel, keramogranit va mozaika terish',
    category: 'Quruvchi',
    city: 'Buxoro',
    price: 650000,
    duration_days: 3,
    cover_image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    orders_count: 29,
    rating: 4.9,
    reviews_count: 18,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 10).toISOString(),
    description: `Vanna, sanuzel, oshxona fartugi va hovli maydonlariga yuqori darajada kafel terish xizmati:
• 45 gradus burchaklarni (zapitilka) silliq kesish
• Lazer sathi bo'yicha 100% tekis tekislash
• Katta formatli keramogranit plitalarni montaj qilish
• Sifatli suv o'tkazmaydigan zatirka surtish.

Ish faqat sifatli kafel yelimlarida bajariladi.`,
    includes: [
      'Lazer sath o\'lchovi',
      '45 gradus aniq burchak kesish',
      'Zatirka (choklarni to\'ldirish) ishlari'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-anvar-104'),
      full_name: 'Anvar Temirov',
      specialty: 'Quruvchi',
      city: 'Buxoro shahar',
      phone: '+998 97 333 44 55',
      telegram: 'anvar_kafel',
      avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 7,
      rating: 4.9,
      reviews_count: 18,
      completed_jobs: 29
    }
  },
  {
    id: toDeterministicUuid('srv-5'),
    title: 'Konditsionerlarni o\'rnatish, tozalash (ximchistka) va freon quyish',
    category: 'Konditsioner',
    city: 'Toshkent',
    price: 250000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1631545897618-508544a7f053?auto=format&fit=crop&w=600&q=80',
    orders_count: 65,
    rating: 5.0,
    reviews_count: 48,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 2).toISOString(),
    description: `Konditsionerlar bo'yicha to'liq servis va montaj xizmatlari:
• Har qanday markadagi konditsionerlarni devorga o'rnatish
• Maxsus vositalar bilan bug'li chuqur ximchistka (bakteriya va hidlarni yo'qotish)
• R410A va R32 original freon quyish
• Suv oqishi (drenaj) muammolarini bartaraf qilish.

Toza va tez xizmat ko'rsatiladi.`,
    includes: [
      'Maxsus germetik sumka bilan devorga zarar yetkazmasdan yuvish',
      'Freon bosimini manometr bilan tekshirish',
      'Konditsioner pulti va rejimlarini sozlash'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-azamat-105'),
      full_name: 'Azamat Nurmatov',
      specialty: 'Konditsioner',
      city: 'Toshkent shahar',
      phone: '+998 99 444 55 66',
      telegram: 'azamat_konditsioner',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 5,
      rating: 5.0,
      reviews_count: 48,
      completed_jobs: 65
    }
  },
  {
    id: toDeterministicUuid('srv-6'),
    title: 'Kir yuvish mashinasi va muzlatgichlarni uyga borib ta\'mirlash',
    category: 'Boshqa',
    city: 'Toshkent',
    price: 200000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    orders_count: 51,
    rating: 4.8,
    reviews_count: 31,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 4).toISOString(),
    description: `Barcha rusumdagi maishiy texnikalarni (LG, Samsung, Artel, Bosch, Beko) sifatli ta'mirlayman:
• Kir yuvish mashinasi podshipnik, ten, nasos va plata ta'miri
• Muzlatgich sovutmasligi, motor va termostat nosozliklari
• Joyida kompyuter diagnostikasi va original zapchastlar.

Kafolat taloni yozib beriladi.`,
    includes: [
      'Uyga yetib borish va diagnostika',
      'Sifatli ehtiyot qismlarni o\'rnatish',
      '6 oydan 1 yilgacha yozma kafolat'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-odil-106'),
      full_name: 'Odilbek Vohidov',
      specialty: 'Maishiy texnika',
      city: 'Toshkent',
      district: 'Chilonzor',
      phone: '+998 90 555 66 77',
      telegram: 'odil_texnika',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 9,
      rating: 4.8,
      reviews_count: 31,
      completed_jobs: 51
    }
  },
  {
    id: toDeterministicUuid('srv-7'),
    title: 'Samarqandda kafel, laminat va yevro pol qoplash xizmatlari',
    category: 'Quruvchi',
    city: 'Samarqand',
    district: '',
    price: 450000,
    duration_days: 3,
    cover_image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    orders_count: 38,
    rating: 5.0,
    reviews_count: 24,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 2).toISOString(),
    description: `Samarqand shahri va atrofida yuqori sifatli kafel va granit terish, laminat hamda parket yotqizish xizmatlari. Lazerli tekislash va aniq qirqish.`,
    includes: [
      'Lazer yordamida tekislik o\'lchovi',
      'Kafel va plitkalarni 45 gradusda qirqish',
      'Zatira va yakuniy tozalash'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-bekzod-107'),
      full_name: 'Bekzod Rahimov',
      specialty: 'Kafel ustasi',
      city: 'Samarqand',
      phone: '+998 93 111 22 33',
      telegram: 'bekzod_kafel',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 7,
      rating: 5.0,
      reviews_count: 24,
      completed_jobs: 38
    }
  },
  {
    id: toDeterministicUuid('srv-8'),
    title: 'Buxoroda mebel yig\'ish, oshxona garnituri va shkaf-kupe o\'rnatish',
    category: 'Duradgor',
    city: 'Buxoro',
    district: '',
    price: 300000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    orders_count: 29,
    rating: 4.9,
    reviews_count: 19,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 1).toISOString(),
    description: `Buxoro bo'ylab barcha turdagi mebellarni professional yig'ish, eshik romlarini o'rnatish va furnitura almashtirish.`,
    includes: [
      'Mebel detallarini shikastlamasdan yig\'ish',
      'Devorga mustahkam mahkamlash',
      'Petlya va eshiklarni rostlash'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-jasur-108'),
      full_name: 'Jasur Shodiyev',
      specialty: 'Duradgor',
      city: 'Buxoro',
      phone: '+998 91 444 55 66',
      telegram: 'jasur_mebel',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 6,
      rating: 4.9,
      reviews_count: 19,
      completed_jobs: 29
    }
  },
  {
    id: toDeterministicUuid('srv-9'),
    title: 'Yunusobodda konditsioner o\'rnatish, tozalash va freon quyish',
    category: 'Konditsioner',
    city: 'Toshkent',
    district: 'Yunusobod',
    price: 250000,
    duration_days: 1,
    cover_image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    orders_count: 64,
    rating: 5.0,
    reviews_count: 42,
    created_at: new Date(Date.now() - 1000 * 3600 * 24 * 1).toISOString(),
    description: `Konditsionerlarni professional o'rnatish, yuvish, par bilan dezinfeksiya qilish va original R410A / R32 freon bilan to'ldirish.`,
    includes: [
      'Vakuum nasos yordamida tizimni tozalash',
      'Par generatori bilan bakteriyalarni yo\'qotish',
      'Freon bosimini o\'lchash'
    ],
    craftsman: {
      id: toDeterministicUuid('craft-sherzod-109'),
      full_name: 'Sherzod Aliyev',
      specialty: 'Konditsioner ustasi',
      city: 'Toshkent',
      district: 'Yunusobod',
      phone: '+998 90 999 88 77',
      telegram: 'sherzod_klimat',
      avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=250&q=80',
      experience_yrs: 8,
      rating: 5.0,
      reviews_count: 42,
      completed_jobs: 64
    }
  }
]

