# Nexsora Loyihasi Xotirasi va Konteksti (Project Memory)

Ushbu hujjat loyiha davomida qilingan barcha muhim qarorlar, yozishmalar va arxitektura o'zgarishlarini eslab qolish uchun xizmat qiladi.

---

## 1. Asosiy Foydalanuvchi Konteksti va Qoidalar
- **Muloqot tili**: O'zbek tili.
- **Loyiha nomi**: Nexsora (Ustalar va mijozlar xizmati platformasi).
- **Texnologiyalar**: Vue 3 (Composition API), Vite, Pinia, Supabase (PostgreSQL + Realtime + Auth), Lucide Icons, Vanilla CSS.

---

## 2. Amalga Oshirilgan Xavfsizlik va Arxitektura Ishlari (10/10 Standarti)
- **Super Admin CRM Redesign (`AdminView.vue` & 5 Subcomponents)**:
  - Upgraded top header card with dark glassmorphism, gradient badges, and live pulse indicator.
  - Upgraded navigation tab bar with active pills and counter badges.
  - Overhauled `AdminOverviewTab.vue` (GMV, net revenue, MRR, bar chart tooltips, health metrics).
  - Overhauled `AdminDisputesTab.vue` (Escrow dispute cards, VS layout, admin verdict actions).
  - Overhauled `AdminVerificationsTab.vue` (KYC craftsmen verification grid, badges).
  - Overhauled `AdminUsersTab.vue` (CRM table, role filtering, search, balance top-up modal).
  - Overhauled `AdminPayoutsTab.vue` (Bank card payout requests).
- **Dashboard Recent Chats Partner Display (`DashboardView.vue`)**:
  - Replaced generic chat ID/emojis with real conversation partner avatars and full names.
  - Linked latest message preview snippet (handling text, voice, and image messages).
  - Fixed initialization TDZ order bug in `ChatsView.vue`.
- **Platform Speed & Performance Optimizations (10/10)**:
  - Configured Vite build chunking strategy (`manualChunks` for Vue, Supabase, Lucide icons).
  - Added DNS prefetching (`dns-prefetch`) and Preconnect (`preconnect`) for Supabase API, Unsplash, and Google Fonts.
  - Implemented 300ms debouncing on search and filter inputs (`src/utils.js` + `JobsView.vue`).
  - Added browser-level `loading="lazy"` and `decoding="async"` to dynamic service/job image cards.
- **5 Strategic Ecosystem Features (10/10 Complete)**:
  1. 💳 **Click & Payme To'lov Shlyuzi**: Uzcard, Humo, Click Up va Payme orqali real vaqtda to'lov va elektron chek generatsiyasi.
  2. 🤖 **AI Narx Kalkulyatori & Smart Match (`AiPriceEstimatorModal.vue`)**: E'lon berishda bozor narxini AI orqali aniqlash va mos ustalarni tavsiya qilish.
  3. 📄 **PDF Shartnoma & Escrow Kafolat Hujjati (`contractGenerator.js`)**: Ikki tomonlama rasmiy kvitansiya va kafolat talonini 1 klikda PDF/chop etish.
  4. 📱 **Telegram WebApp & Mini App Moslashuvi (`telegramWebApp.js` & `bot.js`)**: Telegram ichida avto-kengayish, tema sinxronizatsiyasi va Haptic Feedback tebranishi.
  5. 🔔 **PWA Web Push Bildirishnomalari (`pushNotificationService.js` & `public/sw.js`)**: Brauzer yopiq bo'lsa ham yangi buyurtma va xabarlar haqida bildirishnoma chiqarish.
- **🏗️ Usta Brigadalari va Katta Bino Qurilishlari Moduli (10/10 Complete)**:
  - Yangi ixtisoslashgan qurilish mutaxassisliklari (`G'isht teruvchi`, `Betonchi & Poydevor`, `Tom yopuvchi`, `Suvoqchi & Malyar`, `Kafelchi & Plitochnik`, `Fasadchi`, `Bosh Quruvchi & Brigada`).
  - `src/views/BrigadesView.vue` — Usta brigadalari va jamoalari katalogi. Mijozlar uchun to'g'ridan-to'g'ri «🏢 Katta Loyiha E'lon Qilish» tugmasi joylashtirildi. Ustalardan barcha e'lon berish tugmalari olib tashlandi, faqat «O'z Brigadangizni Tuzing» va «Birjadagi Katta Loyihalar» qoldirildi.

  - `src/components/CreateBrigadeModal.vue` — Ustalarning yangi brigada tuzishi va a'zolarni kiritishi.
  - `src/views/NewJobView.vue` — E'lon berish faqat mijozlar uchun ajratildi; 2 ta rejim kiritildi: 🛠️ **«Oddiy Xizmat / Buyurtma»** va 🏢 **«Katta Loyiha / Bino Qurilishi (Brigada)»**. Katta loyiha tanlanganda bino maydoni (`m²`), qavatlar soni va bosqichma-bosqich Milestone Escrow faollashadi. Ustalar uchun maxsus ogohlantirish va xizmat qo'shish yo'naltirilgan.
  - Navbar va mobil menyuda «🏗️ Brigadalar» bo'limi integratsiyasi.





2. **Autentifikatsiya & Rolga Moslashuvchan Navbar (`src/components/Navbar.vue`)**:
   - `switchRole(role)` orqali foydalanuvchi istalgan payt Usta va Mijoz rejimlari o'rtasida 1-klikda almashishi mumkin.
   - **Usta Navbari**: `Birjadagi buyurtmalarni qidirish...` | `Birja` | `Xizmatlarim` | `+ Xizmat qo'shish` | `Chat`.
   - **Mijoz Navbari**: `Kerakli usta yoki xizmatni qidirish...` | `Usta Qidirish` | `E'lonlarim` | `+ E'lon Joylash` | `Chat`.
   - **Mehmon Navbari**: `Xizmatlar katalogi` | `Birja` | `+ E'lon berish`.
   - Mobil menyu (drawer) ham xuddi shu tarzda 100% ajratildi.



3. **Maxfiy Kalitlar Xavfsizligi**:
   - `.env` va `telegram-bot/.env` fayllari `.gitignore` ga kiritildi.
   - `VITE_` prefiksi bilan brauzerga sizib chiqayotgan Telegram Bot Token olib tashlandi va faqat server tarafida (`telegram-bot/bot.js`) saqlanishi ta'minlandi.
4. **ChatsView Refactoring & Img Upload (`src/views/ChatsView.vue` - 10/10)**:
   - 8 ta modulli komponent (`src/components/chat/`)
   - 📸 **Fotosuratlar & Biriktirmalar**: Mijoz va usta chatda bajarilgan ish suratlarini biriktirib yubora oladi, to'liq ekranli Lightbox.
   - 💬 **Kontekst Menyu**: Orqa fon 100% shaffof (tiniq), menyu xabar pufakchasining yon tomonidan silliq chiqadi, faqat **sichqonchaning o'ng tugmasi (right-click)** bosilganda ochiladi.


5. **ProfileView Refactoring (`src/views/ProfileView.vue` - 10/10)**:
   - `src/components/profile/ProfileHeader.vue` (Hero, avatar upload, kontaktlar)
   - `src/components/profile/ProfileAbout.vue` (Bio tahrirlash, mutaxassisliklar)
   - `src/components/profile/ProfilePortfolio.vue` (Portfolio galereya, lightbox, qo'shish modali)
   - `src/components/profile/ProfileReviews.vue` (Sharhlar tahlili, reyting progress barlar, filtrlash)
   - `src/components/profile/ProfileSidebar.vue` (Statistika, kafolatlar, ulashish)
6. **AdminView Refactoring (`src/views/AdminView.vue` - 10/10)**:
   - `src/components/admin/AdminOverviewTab.vue` (KPI, oylik dinamika, ekotizim holati)
   - `src/components/admin/AdminDisputesTab.vue` (Escrow arbitraj va nizo markazi)
   - `src/components/admin/AdminVerificationsTab.vue` (KYC usta tekshiruvi va tasdiqlash)
   - `src/components/admin/AdminUsersTab.vue` (Foydalanuvchilar CRM, qidiruv, balans, bloklash)
   - `src/components/admin/AdminPayoutsTab.vue` (Pul yechish va tranzaksiyalar)
7. **JobsView & Birja Tizimi (`src/views/JobsView.vue` - 10/10)**:
   - Aqlli saralash: Eng yangilar, Yuqori byudjet, Qulay byudjet, Shoshilinch.
   - Tezkor filtr teglari (Quick Pills): Barchasi, Shoshilinch, Escrow Kafolatli, 1M+ UZS, Toshkent.
   - Tezkor qidiruv, Bookmark (Sevimlilar) va limit indikatori.
