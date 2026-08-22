<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb1"></div>
        <div class="hero-orb2"></div>
        <div class="hero-grid-pattern"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-badge">
          <CheckCircle :size="14" />
          <span>O'zbekistondagi #1 Handyman Platformasi</span>
        </div>
        <h1 class="hero-title">
          Ishonchli Ustani<br />
          <span class="hero-gradient">Tezda Toping</span>
        </h1>
        <p class="hero-subtitle">
          Santexnik, elektrik, quruvchi va boshqa ustalar bilan bir joydan bog'laning.
          E'lon joylashtiring — takliflar daqiqalar ichida kelsin.
        </p>

        <!-- Search Bar -->
        <div class="search-bar">
          <div class="search-field">
            <Search :size="18" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="authStore.isCraftsman ? 'Qanday loyiha yoki ish qidiryapsiz?' : 'Qanday xizmat kerak? (santexnik, elektrik...)'"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <MapPin :size="18" class="search-icon" />
            <input
              v-model="searchCity"
              type="text"
              placeholder="Shahar (Toshkent...)"
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          <button @click="handleSearch" class="search-btn">
            <Search :size="18" />
            <span>Qidirish</span>
          </button>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section categories">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag">Xizmatlar</span>
          <h2>Mashhur Kategoriyalar</h2>
          <p>{{ authStore.isCraftsman ? 'Mijozlar joylashtirgan yangi buyurtmalar va loyihalar' : 'Har qanday uy-ro\'zg\'or ishiga mos ustani toping' }}</p>
        </div>
        <div class="grid-4">
          <router-link
            v-for="cat in categories"
            :key="cat.name"
            :to="authStore.isCraftsman ? `/jobs?category=${cat.name}` : `/services?category=${cat.name}`"
            class="cat-card"
          >
            <div class="cat-icon-wrapper" :style="{ '--cat-color': cat.color }">
              <component :is="cat.icon" :size="30" />
            </div>
            <div class="cat-info">
              <h4 class="cat-name">{{ cat.name }}</h4>
              <span class="cat-count">{{ cat.count }} xizmat</span>
            </div>
            <div class="cat-arrow">→</div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section how-it-works">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag">Qadamlar</span>
          <h2>Qanday Ishlaydi?</h2>
          <p>3 ta oddiy qadam orqali muammoingizni hal qiling</p>
        </div>
        <div class="grid-3">
          <div v-for="step in steps" :key="step.num" class="step-card">
            <div class="step-card-header">
              <div class="step-badge">
                <span class="step-num">{{ step.num }}</span>
              </div>
              <div class="step-icon-box" :style="{ '--step-accent': step.color }">
                <component :is="step.icon" :size="24" />
              </div>
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- REGISTRATION GUIDE SECTION (Only for non-logged in users) -->
    <section v-if="!authStore.isAuthenticated" class="section registration-guide-section" id="guide">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag"><Lightbulb :size="14" /> Yangi foydalanuvchilar uchun</span>
          <h2>Ro'yxatdan o'tish bo'yicha qo'llanma</h2>
          <p>O'zingizga mos rolni tanlang va platformadan foydalanishni oson boshlang</p>
        </div>

        <!-- Role Toggle for Guide -->
        <div class="guide-role-tabs">
          <button
            class="guide-tab-btn"
            :class="{ active: guideRole === 'client' }"
            @click="guideRole = 'client'"
          >
            <Users :size="18" />
            <span>Mijoz (Buyurtmachi) sifatida</span>
          </button>
          <button
            class="guide-tab-btn"
            :class="{ active: guideRole === 'craftsman' }"
            @click="guideRole = 'craftsman'"
          >
            <Wrench :size="18" />
            <span>Usta (Xizmat ko'rsatuvchi) sifatida</span>
          </button>
        </div>

        <!-- Client Guide Steps -->
        <div v-if="guideRole === 'client'" class="guide-steps-grid">
          <div class="guide-card card">
            <div class="guide-step-badge">1-qadam</div>
            <div class="guide-icon-circle client-accent">
              <UserCheck :size="24" />
            </div>
            <h3 class="guide-card-title">Ro'yxatdan o'tishda "Mijoz"ni tanlang</h3>
            <p class="guide-card-desc">
              Ism, telefon raqamingiz, emailingiz va xavfsiz parolni kiriting. Ro'yxatdan o'tish 1 daqiqa vaqt oladi va mutlaqo bepul.
            </p>
            <div class="guide-tip">
              <Lightbulb :size="15" class="tip-icon" /> <em>Tavsiya:</em> Doimiy ishlatadigan telefon raqamingizni kiriting, ustalar siz bilan tez bog'lanishi oson bo'ladi.
            </div>
          </div>

          <div class="guide-card card">
            <div class="guide-step-badge">2-qadam</div>
            <div class="guide-icon-circle client-accent">
              <FilePlus :size="24" />
            </div>
            <h3 class="guide-card-title">E'lon bering yoki Xizmatlarni ko'ring</h3>
            <p class="guide-card-desc">
              <strong>[+ E'lon berish]</strong> orqali qanday ish kerakligini yozing yoki <strong>[Xizmatlar]</strong> bo'limidan tajribali ustalarni tanlang.
            </p>
            <div class="guide-tip">
              <Target :size="15" class="tip-icon" /> Narx va muddatni ko'rsatsangiz, ustalar aniq va tezroq taklif beradi.
            </div>
          </div>

          <div class="guide-card card">
            <div class="guide-step-badge">3-qadam</div>
            <div class="guide-icon-circle client-accent">
              <MessageSquareCheck :size="24" />
            </div>
            <h3 class="guide-card-title">Takliflarni oling va Chatda kelishing</h3>
            <p class="guide-card-desc">
              Kelib tushgan takliflar orasidan eng mos ustani qabul qiling, ichki chatda manzil va boshlash vaqtini kelishib ishni topshiring.
            </p>
            <div class="guide-tip">
              <Star :size="15" class="tip-icon" /> Ish tugagach, ustani baholab sharh qoldiring.
            </div>
          </div>
        </div>

        <!-- Craftsman Guide Steps -->
        <div v-else class="guide-steps-grid">
          <div class="guide-card card">
            <div class="guide-step-badge">1-qadam</div>
            <div class="guide-icon-circle craft-accent">
              <Wrench :size="24" />
            </div>
            <h3 class="guide-card-title">Ro'yxatdan o'tishda "Usta"ni tanlang</h3>
            <p class="guide-card-desc">
              Ismingiz, mutaxassislik yo'nalishlaringiz (Santexnik, Elektrik, Mebel va h.k.) hamda tajriba yilingizni belgilang.
            </p>
            <div class="guide-tip">
              <Lightbulb :size="15" class="tip-icon" /> <em>Tavsiya:</em> Profilingizga o'z suratingizni qo'ysangiz, mijozlarda ishonch 2 barobar ortadi.
            </div>
          </div>

          <div class="guide-card card">
            <div class="guide-step-badge">2-qadam</div>
            <div class="guide-icon-circle craft-accent">
              <Sparkles :size="24" />
            </div>
            <h3 class="guide-card-title">Xizmatlaringizni joylang yoki Birjadan ish oling</h3>
            <p class="guide-card-desc">
              <strong>[+ Xizmat qo'shish]</strong> orqali portfolio va narxlaringizni e'lon qiling yoki <strong>[Birja]</strong> bo'limidagi yangi mijozlar e'lonlariga o'z taklifingizni yuboring.
            </p>
            <div class="guide-tip">
              <Zap :size="15" class="tip-icon" /> Birinchi bo'lib taklif yuborgan ustalarga buyurtma berish ehtimoli yuqori.
            </div>
          </div>

          <div class="guide-card card">
            <div class="guide-step-badge">3-qadam</div>
            <div class="guide-icon-circle craft-accent">
              <ShieldCheck :size="24" />
            </div>
            <h3 class="guide-card-title">Ishni bajaring va Reytingni oshiring</h3>
            <p class="guide-card-desc">
              Mijoz bilan chatda kelishib ishni sifatli bajaring, ish tugagach mijozdan ijobiy baho oling va platformadagi yetakchi ustalar qatoriga kiring.
            </p>
            <div class="guide-tip">
              <Star :size="15" class="tip-icon" /> Har bir 5 yulduzli baho yangi mijozlar oqimini oshiradi.
            </div>
          </div>
        </div>

        <!-- Direct CTA From Guide -->
        <div class="guide-cta-row">
          <router-link
            :to="guideRole === 'client' ? '/register?role=client' : '/register?role=craftsman'"
            class="btn btn-primary btn-lg guide-reg-btn"
          >
            <component :is="guideRole === 'client' ? Users : Wrench" :size="20" />
            <span>{{ guideRole === 'client' ? "Mijoz sifatida ro'yxatdan o'tish →" : "Usta sifatida ro'yxatdan o'tish →" }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA (Only for non-logged in users) -->
    <section v-if="!authStore.isAuthenticated" class="section cta">
      <div class="container">
        <div class="cta-box">
          <div class="cta-bg-glow"></div>
          <div class="cta-header">
            <span class="cta-tag">Tezkor Bog'lanish</span>
            <h2>Bugun Boshlang!</h2>
            <p>O'zbekistondagi minglab ustalar va mijozlarga qo'shiling</p>
          </div>
          <div class="cta-btns">
            <router-link to="/register?role=client" class="btn btn-primary btn-lg cta-btn-main">
              <Users :size="20" />
              <span>Mijoz sifatida kirish</span>
            </router-link>
            <router-link to="/register?role=craftsman" class="btn btn-secondary btn-lg cta-btn-sub">
              <Wrench :size="20" />
              <span>Usta sifatida kirish</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  Wrench, Zap, Droplets, Hammer, CheckCircle, Search, MapPin, Users,
  FilePlus, Tag, MessageSquareCheck, UserCheck, Sparkles, ShieldCheck,
  Lightbulb, Target, Star
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const searchCity = ref('')
const guideRole = ref('client')

function handleSearch() {
  const queryObj = {}
  if (searchQuery.value.trim()) queryObj.q = searchQuery.value.trim()
  if (searchCity.value.trim()) queryObj.city = searchCity.value.trim()
  const targetPath = authStore.isCraftsman ? '/jobs' : '/services'
  router.push({ path: targetPath, query: queryObj })
}

const categories = [
  { icon: Droplets, name: 'Santexnik', count: '120+', color: '#4ECDC4' },
  { icon: Zap, name: 'Elektrik', count: '98+', color: '#F7B731' },
  { icon: Hammer, name: 'Quruvchi', count: '200+', color: '#FF6584' },
  { icon: Wrench, name: 'Temirchi', count: '75+', color: '#6C63FF' },
]

const steps = [
  {
    num: '01',
    icon: FilePlus,
    color: '#6C63FF',
    title: "E'lon Joylashtiring",
    desc: "Kerakli xizmat turi, byudjet va manzilni kiriting. Daqiqalar ichida usta takliflari keladi."
  },
  {
    num: '02',
    icon: Tag,
    color: '#FF6584',
    title: "Taklif Oling",
    desc: "Tajribali ustalar o'z narxlari, bajarish muddati hamda shartlari bilan taklif berishadi."
  },
  {
    num: '03',
    icon: MessageSquareCheck,
    color: '#43E97B',
    title: "Kelishing",
    desc: "Chat orqali bevosita muloqot qiling, baholarni solishtiring va eng yaxshi ustani tanlang."
  },
]
</script>

<style scoped>
.home { min-height: 100vh; background: var(--color-bg); }

/* HERO */
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0 60px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.6;
}

.hero-orb1 {
  position: absolute;
  top: -80px;
  left: 20%;
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(50px);
}

.hero-orb2 {
  position: absolute;
  bottom: -60px;
  right: 15%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(67,233,123,0.15) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(50px);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(108,99,255,0.12);
  border: 1px solid rgba(108,99,255,0.3);
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary-light);
  box-shadow: 0 4px 14px rgba(108,99,255,0.1);
}

.hero-title {
  font-size: clamp(2.6rem, 6.5vw, 4.5rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.5px;
}

.hero-gradient {
  background: linear-gradient(135deg, #6C63FF 0%, #FF6584 50%, #43E97B 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: var(--color-text-2);
  max-width: 620px;
  line-height: 1.6;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 6px 6px 6px 22px;
  width: 100%;
  max-width: 720px;
  box-shadow: var(--shadow-lg);
  transition: all 250ms ease;
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 12px 48px rgba(108,99,255,0.25), 0 0 0 2px var(--color-primary);
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.search-icon { color: var(--color-primary-light); }

.search-input {
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 0.9rem;
  width: 100%;
  outline: none;
}

.search-input::placeholder { color: var(--color-muted); }

.search-divider {
  width: 1px;
  height: 28px;
  background: var(--color-border);
  margin: 0 16px;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  background: linear-gradient(135deg, #6C63FF 0%, #5B52E0 100%);
  border: none;
  border-radius: 9999px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(108,99,255,0.35);
  transition: all 150ms ease;
}

.search-btn:hover {
  transform: scale(1.02);
  background: linear-gradient(135deg, #7C74FF 0%, #6C63FF 100%);
  box-shadow: 0 6px 20px rgba(108,99,255,0.45);
}

/* SECTIONS COMMON */
.section { padding: 90px 0; }
.section-header { margin-bottom: 56px; }

.section-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-primary-light);
  background: rgba(108,99,255,0.1);
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.section-header p {
  color: var(--color-text-2);
  font-size: 1.05rem;
}

.text-center { text-align: center; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

/* CATEGORIES SECTION */
.categories { background: var(--color-bg); }

.cat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  text-decoration: none;
  transition: all 250ms ease;
  position: relative;
}

.cat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(108,99,255,0.3);
  box-shadow: var(--shadow-lg);
  background: var(--color-surface);
}

.cat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cat-color);
  flex-shrink: 0;
  transition: transform 200ms ease;
}

.cat-card:hover .cat-icon-wrapper {
  transform: scale(1.1);
  background: rgba(108,99,255,0.12);
}

.cat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.cat-count {
  font-size: 0.8rem;
  color: var(--color-muted);
  margin-top: 2px;
}

.cat-arrow {
  font-size: 1.1rem;
  color: var(--color-muted);
  transition: all 200ms ease;
}

.cat-card:hover .cat-arrow {
  color: var(--color-primary-light);
  transform: translateX(4px);
}

/* HOW IT WORKS SECTION */
.how-it-works { background: var(--color-bg); }

.step-card {
  padding: 36px 30px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: all 300ms ease;
  position: relative;
}

.step-card:hover {
  transform: translateY(-8px);
  border-color: rgba(108,99,255,0.35);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(108,99,255,0.15);
}

.step-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-badge {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(67,233,123,0.15) 100%);
  border: 1px solid rgba(108,99,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-num {
  font-size: 1.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #6C63FF, #43E97B);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.step-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--step-accent);
}

.step-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
}

.step-desc {
  font-size: 0.92rem;
  color: var(--color-text-2);
  line-height: 1.65;
}

/* REGISTRATION GUIDE SECTION */
.registration-guide-section {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 80px 0;
}

.guide-role-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.guide-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 9999px;
  background: var(--color-card);
  border: 2px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.guide-tab-btn:hover {
  border-color: var(--color-primary-light);
  color: var(--color-text);
  transform: translateY(-2px);
}

.guide-tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3);
}

.guide-steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.guide-card {
  padding: 36px 28px 30px;
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  transition: all 300ms ease;
  border: 1px solid var(--color-border);
}

.guide-card:hover {
  transform: translateY(-6px);
  border-color: rgba(108, 99, 255, 0.35);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2);
}

.guide-step-badge {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-primary-light);
  background: rgba(108, 99, 255, 0.12);
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(108, 99, 255, 0.25);
}

.guide-icon-circle {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.client-accent {
  background: rgba(108, 99, 255, 0.15);
  color: var(--color-primary-light);
  border: 1px solid rgba(108, 99, 255, 0.3);
}

.craft-accent {
  background: rgba(67, 233, 123, 0.15);
  color: var(--color-success);
  border: 1px solid rgba(67, 233, 123, 0.3);
}

.guide-card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 10px;
  line-height: 1.4;
}

.guide-card-desc {
  font-size: 0.9rem;
  color: var(--color-text-2);
  line-height: 1.6;
  margin-bottom: 18px;
}

.guide-tip {
  margin-top: auto;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  color: var(--color-text-2);
  line-height: 1.5;
}

.guide-cta-row {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.guide-reg-btn {
  padding: 16px 36px;
  font-size: 1.05rem;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(108, 99, 255, 0.35);
}

/* CTA SECTION */
.cta { background: var(--color-bg); }

.cta-box {
  position: relative;
  text-align: center;
  padding: 80px 40px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,101,132,0.1) 50%, rgba(67,233,123,0.12) 100%), var(--color-card);
  border: 1px solid rgba(108,99,255,0.3);
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.cta-bg-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.cta-header {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto 36px;
}

.cta-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-success);
  background: rgba(67,233,123,0.15);
  border: 1px solid rgba(67,233,123,0.3);
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.cta-box h2 {
  font-size: 2.6rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.cta-box p {
  font-size: 1.1rem;
  color: var(--color-text-2);
}

.cta-btns {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn-main {
  padding: 14px 32px;
  font-size: 1rem;
  box-shadow: 0 8px 24px rgba(108,99,255,0.35);
}

.cta-btn-sub {
  padding: 14px 32px;
  font-size: 1rem;
}

@media (max-width: 900px) {
  .hero { padding: 50px 0 40px; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: 1fr; }
  .search-bar { flex-direction: column; border-radius: 24px; padding: 16px; gap: 12px; }
  .search-divider { display: none; }
  .search-btn { width: 100%; justify-content: center; }
  .cta-box { padding: 50px 20px; }
}
</style>
