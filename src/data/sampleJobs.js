import { toDeterministicUuid } from '../utils'

export const SAMPLE_CLIENT_JOBS = [
  {
    id: toDeterministicUuid('sample-job-1'),
    client_id: toDeterministicUuid('client-dilshod-1'),
    title: 'Novostroyka xonadonga santexnika quvurlari va dush kabinasini o\'rnatish',
    category: 'Santexnik',
    city: 'Toshkent',
    budget_min: 1200000,
    budget_max: 2500000,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
    description: 'Yangi ko\'p qavatli uyda (novostroyka) 2 ta sanuzel uchun dush kabinasi, unitaz, rakovina va plastik quvurlarni to\'liq montaj qilish kerak. Barcha sifatli quvur va kranlar sotib olingan. Ishni puxta, oqmaydigan va toza qilib bitirib beradigan tajribali usta kerak. Muddat: 2-3 kun.',
    profiles: {
      id: toDeterministicUuid('client-dilshod-1'),
      full_name: 'Dilshod Karimov',
      city: 'Toshkent (Chilonzor tumani)',
      phone: '+998 90 345 67 89',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      role: 'client',
      client_profiles: {
        rating: 5.0,
        reviews_count: 8
      }
    }
  },
  {
    id: toDeterministicUuid('sample-job-2'),
    client_id: toDeterministicUuid('client-malika-2'),
    title: '120 kv.m ofis binosida elektr montaj, avtomat shit va lyustralarni ulash',
    category: 'Elektrik',
    city: 'Toshkent',
    budget_min: 2000000,
    budget_max: 4000000,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    description: 'Yangi ofis maydonida elektr taqsimlash shiti (avtomatlar) yig\'ish, 32 ta rozetka nuqtalarini o\'rnatish, LED panel yoritgichlari va asosiy qandillarni xavfsiz ulash talab qilinadi. Barcha simlar devor ichidan tortilgan. Xavfsizlik standartlariga javob beruvchi usta kerak.',
    profiles: {
      id: toDeterministicUuid('client-malika-2'),
      full_name: 'Malika Usmonova',
      city: 'Toshkent (Yunusobod tumani)',
      phone: '+998 97 712 34 56',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'client',
      client_profiles: {
        rating: 4.9,
        reviews_count: 14
      }
    }
  },
  {
    id: toDeterministicUuid('sample-job-3'),
    client_id: toDeterministicUuid('client-javohir-3'),
    title: '3.2 metrli yangi oshxona mebelini yig\'ish va moykani o\'rnatish',
    category: 'Duradgor',
    city: 'Samarqand',
    budget_min: 800000,
    budget_max: 1600000,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    description: 'Fabrikadan keltirilgan modulli oshxona mebelini (kuxonnyy garnitur) to\'liq yig\'ish, stoleshnitsani kesib moyka va gaz plita uchun joy ochish, eshik mexanizmlari (dovodchiklar)ni sozlash lozim. Asbob-uskunalari o\'zi bilan bo\'lgan usta kerak.',
    profiles: {
      id: toDeterministicUuid('client-javohir-3'),
      full_name: 'Javohir To\'rayev',
      city: 'Samarqand shahar',
      phone: '+998 93 456 78 90',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      role: 'client',
      client_profiles: {
        rating: 5.0,
        reviews_count: 5
      }
    }
  },
  {
    id: toDeterministicUuid('sample-job-4'),
    client_id: toDeterministicUuid('client-nodira-4'),
    title: 'LG 7kg invertorli kir yuvish mashinasini ta\'mirlash (podshipnik almashtirish)',
    category: 'Boshqa',
    city: 'Toshkent',
    budget_min: 350000,
    budget_max: 750000,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    description: 'LG kir yuvish mashinasidan siqish (otjim) paytida kuchli g\'alati shovqin va tebranish chiqmoqda. Taxminimcha podshipnik yoki salnik almashtirish kerak. Xonadonga kelib diagnostika qilib, kafolatli qilib sozlab beradigan usta kerak.',
    profiles: {
      id: toDeterministicUuid('client-nodira-4'),
      full_name: 'Nodira Rahimova',
      city: 'Toshkent (Mirzo Ulug\'bek)',
      phone: '+998 91 123 98 76',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      role: 'client',
      client_profiles: {
        rating: 4.8,
        reviews_count: 11
      }
    }
  },
  {
    id: toDeterministicUuid('sample-job-5'),
    client_id: toDeterministicUuid('client-farrux-5'),
    title: 'Hovli yo\'lagiga 85 kv.m bruschatka va ayvonga kafel terish',
    category: 'Quruvchi',
    city: 'Buxoro',
    budget_min: 4000000,
    budget_max: 7500000,
    status: 'open',
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(), // 8 hours ago
    description: 'Hovli ichki yo\'laklari, garaj oldi va ayvon qismiga sifatli bruschatka hamda granit kafel terish kerak. Yerni tekislash, qum-sement tayyorgarlik ishlari bilan birga. Ish sifati yuqori bo\'lishi shart. Barcha qurilish mollari yetkazilgan.',
    profiles: {
      id: toDeterministicUuid('client-farrux-5'),
      full_name: 'Farrux Qodirov',
      city: 'Buxoro shahar',
      phone: '+998 94 654 32 10',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      role: 'client',
      client_profiles: {
        rating: 5.0,
        reviews_count: 19
      }
    }
  }
]
