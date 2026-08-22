<template>
  <div class="brigades-page">
    <main class="container brigades-main">
      
      <!-- HERO HEADER CARD -->
      <div class="brigades-hero-card">
        <div class="hero-content">
          <div class="hero-badge">
            <HardHat :size="16" />
            <span>Katta Qurilish Obyektlari & Pudratchilar</span>
          </div>
          <h1 class="hero-title">Usta Brigadalari & Qurilish Jamoalari</h1>
          <p class="hero-subtitle">
            Hovli, kottej, ofis va binolarni noldan kalitgacha qurish uchun professional jamoalarni toping yoki o'z brigadangizni tuzing!
          </p>

          <!-- Action Buttons -->
          <div class="hero-actions">
            <!-- For Craftsmen / Guests: Create Brigade -->
            <button v-if="authStore.isCraftsman || !authStore.isAuthenticated" class="btn btn-warning btn-lg" @click="showCreateModal = true">
              <Plus :size="18" />
              <span>O'z Brigadangizni Tuzing</span>
            </button>

            <!-- For Clients ONLY: Post Big Project / Building Job -->
            <router-link v-if="!authStore.isCraftsman" to="/jobs/new?type=building" class="btn btn-secondary btn-lg">
              <Building2 :size="18" />
              <span>Katta Loyiha E'lon Qilish</span>
            </router-link>

            <!-- For Craftsmen ONLY: View Big Projects in Birja -->
            <router-link v-if="authStore.isCraftsman" to="/jobs?category=Quruvchi%20%26%20Brigada" class="btn btn-secondary btn-lg">
              <Briefcase :size="18" />
              <span>Birjadagi Katta Loyihalar</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div class="toolbar-box">
        <div class="toolbar-card card">
          <!-- Search box -->
          <div class="search-input-box">
            <Search :size="18" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="input search-input"
              placeholder="Brigada nomi, yo'nalishi (g'isht, suvoq, tom...) yoki brigadir ismi..."
            />
          </div>

          <!-- Filters Row -->
          <div class="filters-row">
            <div class="filter-item">
              <span class="filter-label"><MapPin :size="14" /> Shahar:</span>
              <CustomSelect
                v-model="selectedCity"
                :options="[{ value: '', label: 'Barcha hududlar', icon: MapPin }, ...CITY_OPTIONS]"
                placeholder="Barcha hududlar"
                search-placeholder="Shaharni qidirish..."
                size="sm"
                clearable
              />
            </div>

            <div class="filter-item">
              <span class="filter-label"><Users :size="14" /> Jamoa hajmi:</span>
              <CustomSelect
                v-model="selectedSize"
                :options="SIZE_OPTIONS"
                placeholder="Jamoa hajmi"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Quick Specialties Pills -->
        <div class="specialties-scroll-row">
          <button
            class="spec-pill"
            :class="{ active: selectedSpecialty === '' }"
            @click="selectedSpecialty = ''"
          >
            <Sparkles :size="14" />
            <span>Barcha Yo'nalishlar</span>
          </button>
          <button
            v-for="spec in specialtyOptions"
            :key="spec.name"
            class="spec-pill"
            :class="{ active: selectedSpecialty === spec.name }"
            @click="selectedSpecialty = spec.name"
          >
            <component :is="spec.icon" :size="14" />
            <span>{{ spec.name }}</span>
          </button>
        </div>
      </div>

      <!-- BRIGADES GRID SECTION -->
      <div class="brigades-list-section">
        <div class="section-heading">
          <div>
            <h2>Mavjud Qurilish Brigadalari</h2>
            <p>{{ filteredBrigades.length }} ta tasdiqlangan jamoa faoliyat yuritmoqda</p>
          </div>
        </div>

        <div v-if="filteredBrigades.length === 0" class="empty-state-card card">
          <Wrench :size="48" class="text-muted" />
          <h3>Mos keladigan brigada topilmadi</h3>
          <p>Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.</p>
          <button class="btn btn-secondary btn-sm" @click="resetFilters">Filtrlarni tozalash</button>
        </div>

        <div v-else class="brigades-grid">
          <div
            v-for="brigade in filteredBrigades"
            :key="brigade.id"
            class="brigade-card card"
          >
            <!-- Card Cover Image with badges -->
            <div class="card-cover-wrap">
              <img :src="brigade.coverImage" :alt="brigade.name" class="card-cover-img" loading="lazy" />
              <div class="cover-overlay"></div>
              
              <!-- Badges -->
              <span class="team-size-badge">
                <Users :size="13" /> {{ brigade.teamSize }} kishilik jamoa
              </span>

              <span v-if="brigade.isVerified" class="verified-badge-top">
                <BadgeCheck :size="14" /> Tasdiqlangan Brigada
              </span>
            </div>

            <!-- Card Body -->
            <div class="card-body-content">
              
              <!-- Title & Rating -->
              <div class="card-top-header">
                <div>
                  <h3 class="brigade-name">{{ brigade.name }}</h3>
                  <div class="leader-row">
                    <span class="leader-label">Brigadir:</span>
                    <strong>{{ brigade.leaderName }}</strong>
                  </div>
                </div>
                <div class="rating-badge-box">
                  <Star :size="15" class="star-icon" />
                  <strong>{{ brigade.rating.toFixed(2) }}</strong>
                  <span class="reviews-count">({{ brigade.reviewsCount }})</span>
                </div>
              </div>

              <!-- City & Experience -->
              <div class="meta-pills-row">
                <span class="meta-pill"><MapPin :size="13" /> {{ brigade.city }}</span>
                <span class="meta-pill"><Award :size="13" /> {{ brigade.experienceYears }} yillik tajriba</span>
                <span class="meta-pill text-success"><Building2 :size="13" /> {{ brigade.completedProjects }} ta bino</span>
              </div>

              <!-- Description -->
              <p class="brigade-desc">
                {{ brigade.description }}
              </p>

              <!-- Team Structure / Members Composition -->
              <div class="team-composition-box">
                <span class="comp-label">Jamoa tarkibi:</span>
                <div class="comp-tags-row">
                  <div v-for="m in brigade.members" :key="m.role" class="comp-tag">
                    <Users :size="12" class="text-primary" />
                    <span>{{ m.role }}: <strong>{{ m.count }} ta</strong></span>
                  </div>
                </div>
              </div>

              <!-- Price Rate -->
              <div class="price-rate-box">
                <span class="rate-label">Narx stavkasi:</span>
                <strong class="rate-val">{{ brigade.priceRate }}</strong>
              </div>

              <!-- Card Actions -->
              <div class="card-actions-row">
                <a :href="`tel:${brigade.leaderPhone}`" class="btn btn-secondary btn-sm btn-call">
                  <Phone :size="15" />
                  <span>Qo'ng'iroq</span>
                </a>
                <router-link
                  v-if="!authStore.isCraftsman"
                  :to="`/jobs/new?category=Quruvchi%20%26%20Brigada&brigade=${brigade.id}`"
                  class="btn btn-warning btn-sm btn-hire"
                >
                  <Briefcase :size="15" />
                  <span>Obyektga Taklif Qilish</span>
                </router-link>
                <a
                  v-else
                  :href="`tel:${brigade.leaderPhone}`"
                  class="btn btn-warning btn-sm btn-hire"
                >
                  <Phone :size="15" />
                  <span>Hamkorlik Qilish</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </main>

    <!-- CREATE BRIGADE MODAL -->
    <CreateBrigadeModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleBrigadeCreated"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  HardHat, Plus, Building2, Search, MapPin, Users,
  BadgeCheck, Star, Award, Phone, Briefcase, Wrench,
  Layers, Home, Paintbrush, Grid, Building, Hammer, Sparkles
} from 'lucide-vue-next'
import { UZ_CITIES, CITY_OPTIONS } from '../utils'
import { SAMPLE_BRIGADES } from '../data/sampleBrigades'
import { useAuthStore } from '../stores/auth'
import CreateBrigadeModal from '../components/CreateBrigadeModal.vue'
import CustomSelect from '../components/CustomSelect.vue'

const authStore = useAuthStore()

const SIZE_OPTIONS = [
  { value: 'all', label: 'Barchasi', icon: Users },
  { value: 'small', label: 'Kichik (2 - 5 kishi)', icon: Users },
  { value: 'medium', label: "O'rta (6 - 12 kishi)", icon: Users },
  { value: 'large', label: 'Katta (13+ kishi)', icon: Users },
]

const searchQuery = ref('')
const selectedCity = ref('')
const selectedSize = ref('all')
const selectedSpecialty = ref('')
const showCreateModal = ref(false)

const brigades = ref([...SAMPLE_BRIGADES])

const specialtyOptions = [
  { name: 'G\'isht teruvchi', icon: Layers },
  { name: 'Betonchi & Poydevor', icon: Layers },
  { name: 'Tom yopuvchi', icon: Home },
  { name: 'Suvoqchi & Malyar', icon: Paintbrush },
  { name: 'Kafelchi & Plitochnik', icon: Grid },
  { name: 'Fasadchi', icon: Building },
  { name: 'Temirchi & Svarka', icon: Hammer }
]

function loadCustomBrigades() {
  try {
    const local = JSON.parse(localStorage.getItem('nexsora_custom_brigades') || '[]')
    if (local.length > 0) {
      brigades.value = [...local, ...SAMPLE_BRIGADES]
    }
  } catch (e) {}
}

function handleBrigadeCreated(newBrigade) {
  brigades.value.unshift(newBrigade)
}

function resetFilters() {
  searchQuery.value = ''
  selectedCity.value = ''
  selectedSize.value = 'all'
  selectedSpecialty.value = ''
}

const filteredBrigades = computed(() => {
  return brigades.value.filter(b => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q ||
      b.name.toLowerCase().includes(q) ||
      b.leaderName.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.specialties.some(s => s.toLowerCase().includes(q))

    const matchesCity = !selectedCity.value || b.city.includes(selectedCity.value)

    let matchesSize = true
    if (selectedSize.value === 'small') matchesSize = b.teamSize <= 5
    if (selectedSize.value === 'medium') matchesSize = b.teamSize >= 6 && b.teamSize <= 12
    if (selectedSize.value === 'large') matchesSize = b.teamSize >= 13

    const matchesSpec = !selectedSpecialty.value || b.specialties.includes(selectedSpecialty.value)

    return matchesSearch && matchesCity && matchesSize && matchesSpec
  })
})

onMounted(() => {
  loadCustomBrigades()
})
</script>

<style scoped>
.brigades-page {
  background: var(--color-bg);
  min-height: calc(100vh - 68px);
}

.brigades-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px clamp(16px, 3.5vw, 32px) 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  box-sizing: border-box;
}

/* HERO CARD */
.brigades-hero-card {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(108, 99, 255, 0.08) 100%), var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: var(--shadow-sm);
}

.hero-content {
  max-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.15);
  color: #D97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  width: fit-content;
}

.hero-title {
  font-size: 2.1rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.02rem;
  color: var(--color-text-2);
  line-height: 1.55;
  margin: 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* TOOLBAR */
.toolbar-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.toolbar-card {
  padding: 16px 20px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input-box {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.92rem;
  outline: none;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 0.82rem;
  color: var(--color-muted);
  font-weight: 600;
}

.select-clean {
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.88rem;
  outline: none;
  cursor: pointer;
}

/* SPECIALTY PILLS */
.specialties-scroll-row {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  width: 100%;
}

.spec-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.spec-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.spec-pill.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* BRIGADES GRID */
.brigades-list-section {
  width: 100%;
}

.section-heading h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-text);
}

.section-heading p {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 2px 0 20px;
}

.brigades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
}

.brigade-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.brigade-card:hover {
  transform: translateY(-4px);
  border-color: #F59E0B;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
}

.card-cover-wrap {
  position: relative;
  height: 180px;
  width: 100%;
  overflow: hidden;
}

.card-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
}

.team-size-badge {
  position: absolute;
  bottom: 12px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
}

.verified-badge-top {
  position: absolute;
  top: 12px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #3B82F6;
  color: white;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.card-body-content {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.card-top-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.brigade-name {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.leader-row {
  font-size: 0.82rem;
  color: var(--color-text-2);
  margin-top: 2px;
}

.leader-label {
  color: var(--color-muted);
  margin-right: 4px;
}

.rating-badge-box {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(245, 158, 11, 0.12);
  color: #D97706;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
}

.star-icon {
  color: #F59E0B;
  fill: #F59E0B;
}

.reviews-count {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.meta-pills-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: var(--color-muted);
  font-weight: 600;
}

.brigade-desc {
  font-size: 0.86rem;
  color: var(--color-text-2);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.team-composition-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comp-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
}

.comp-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.comp-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--color-text);
}

.price-rate-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rate-label {
  font-size: 0.72rem;
  color: var(--color-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.rate-val {
  font-size: 0.86rem;
  color: var(--color-text);
  line-height: 1.4;
}

.card-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
}

.btn-call {
  font-weight: 600;
  text-decoration: none;
}

.btn-hire {
  flex: 1;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border: none;
  color: white;
  text-decoration: none;
}

.empty-state-card {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>
