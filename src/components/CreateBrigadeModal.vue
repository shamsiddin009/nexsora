<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card card">
      
      <!-- Header -->
      <div class="modal-header">
        <div class="header-left">
          <div class="icon-box-gradient">
            <Users :size="22" />
          </div>
          <div>
            <h3>Yangi Usta Brigadasini Tuzish</h3>
            <p class="modal-subtitle">Katta qurilish obyektlari va buyurtmalarni jamoa bilan birgalikda bajaring</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')"><X :size="18" /></button>
      </div>

      <!-- Form Body -->
      <form class="modal-body" @submit.prevent="handleCreateBrigade">
        
        <div class="form-group">
          <label class="input-label">Brigada (Jamoa) Nomi:</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input"
            placeholder="Masalan: Yuksalish Grand Stroy Jamoasi"
          />
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="input-label">Brigadir (Yetakchi) Ismi:</label>
            <input
              v-model="form.leaderName"
              type="text"
              required
              class="input"
              placeholder="Ism Familiya"
            />
          </div>
          <div class="form-group">
            <label class="input-label">Aloqa Telefoni:</label>
            <input
              :value="form.leaderPhone"
              type="tel"
              inputmode="tel"
              maxlength="19"
              required
              class="input"
              placeholder="+998 (90) 123-45-67"
              @input="form.leaderPhone = formatUzbekPhone($event.target.value)"
            />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="input-label">Shahar / Viloyat:</label>
            <CustomSelect
              v-model="form.city"
              :options="CITY_OPTIONS"
              placeholder="Shahar tanlang"
              search-placeholder="Shaharni qidirish..."
            />
          </div>
          <div class="form-group">
            <label class="input-label">Jamoa a'zolari soni (Kishi):</label>
            <input
              v-model.number="form.teamSize"
              type="number"
              min="2"
              max="100"
              required
              class="input"
              placeholder="Masalan: 8"
            />
          </div>
        </div>

        <!-- Specialty Tags Selector -->
        <div class="form-group">
          <label class="input-label">Jamoangizning asosiy ixtisoslashuvlari:</label>
          <div class="specialties-picker">
            <button
              v-for="cat in constructionTags"
              :key="cat"
              type="button"
              class="tag-pick-btn"
              :class="{ active: form.specialties.includes(cat) }"
              @click="toggleSpecialty(cat)"
            >
              <span>{{ cat }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="input-label">O'rtacha narx stavkasi va shartlar:</label>
          <input
            v-model="form.priceRate"
            type="text"
            class="input"
            placeholder="Masalan: 1 m² g'isht: 180,000 so'm | Kalitgacha: 500,000 so'm/m²"
          />
        </div>

        <div class="form-group">
          <label class="input-label">Jamoa haqida qisqacha ma'lumot va tajriba:</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="input textarea"
            placeholder="Qanday binolarni qurasiz? O'zingizning texnikangiz bormi? Tajribangiz necha yil?"
          ></textarea>
        </div>

        <!-- Member Search Section -->
        <div class="form-group member-search-section">
          <label class="input-label"><Users :size="15" class="inline-icon" /> Jamoa a'zolarini qo'shish (Ism yoki telefon raqam):</label>
          <div class="member-search-row">
            <div class="member-search-input-wrap">
              <Search :size="15" class="search-icon-inner" />
              <input
                v-model="memberQuery"
                type="text"
                class="input member-search-input"
                placeholder="Do'stingizning ismi yoki +998 90 ... raqamini kiriting"
                @input="searchMembers"
              />
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results-list">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="search-result-item"
              @click="addMember(user)"
            >
              <div class="result-avatar">{{ getInitials(user.full_name) }}</div>
              <div class="result-info">
                <strong>{{ user.full_name }}</strong>
                <span>{{ user.phone || user.city || 'Usta' }}</span>
              </div>
              <button type="button" class="add-member-btn"><UserPlus :size="14" /> Qo'shish</button>
            </div>
          </div>
          <div v-else-if="memberQuery.length > 1 && !searching" class="search-empty">
            <span>Hech kim topilmadi — ismi yoki raqamini to'g'ri kiritdingizmi?</span>
          </div>
          <div v-if="searching" class="search-loading">Qidirilmoqda...</div>

          <!-- Added Members List -->
          <div v-if="addedMembers.length > 0" class="added-members-list">
            <div class="added-members-label">Qo'shilgan a'zolar ({{ addedMembers.length }} kishi):</div>
            <div v-for="m in addedMembers" :key="m.id" class="added-member-chip">
              <span>{{ m.full_name }}</span>
              <button type="button" class="chip-remove" @click="removeMember(m.id)"><X :size="12" /></button>
            </div>
          </div>

          <!-- Invite Link Section -->
          <div class="invite-link-box">
            <Link2 :size="14" />
            <span>Yoki do'stingizga <strong>taklif havolasini</strong> yuboring:</span>
            <button type="button" class="copy-link-btn" @click="copyInviteLink">
              <Check :size="14" v-if="linkCopied" />
              <Link2 :size="14" v-else />
              <span>{{ linkCopied ? 'Nusxalandi!' : 'Havolani nusxalash' }}</span>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Bekor qilish</button>
          <button type="submit" class="btn btn-primary btn-submit-brigade" :disabled="saving">
            <Check :size="16" />
            <span>{{ saving ? 'Saqlanmoqda...' : 'Brigadani Ro\'yxatdan O\'tkazish' }}</span>
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Users, X, Check, Search, UserPlus, Link2 } from 'lucide-vue-next'
import { UZ_CITIES, CITY_OPTIONS, getInitials } from '../utils'
import { formatUzbekPhone } from '../utils/phoneMask'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import CustomSelect from './CustomSelect.vue'

defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'created'])
const authStore = useAuthStore()
const toast = useToast()

const constructionTags = [
  'G\'isht teruvchi',
  'Betonchi & Poydevor',
  'Tom yopuvchi',
  'Suvoqchi & Malyar',
  'Kafelchi & Plitochnik',
  'Fasadchi',
  'Santexnik',
  'Elektrik',
  'Temirchi & Svarka'
]

const saving = ref(false)

// Member search
const memberQuery = ref('')
const searchResults = ref([])
const addedMembers = ref([])
const searching = ref(false)
const linkCopied = ref(false)

let searchTimeout = null
async function searchMembers() {
  clearTimeout(searchTimeout)
  if (memberQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      // Search in localStorage users first (offline)
      const localSession = localStorage.getItem('nexsora_auth_session')
      const localResults = []
      if (localSession) {
        const parsed = JSON.parse(localSession)
        if (parsed?.profile && parsed.profile.role === 'craftsman') {
          const q = memberQuery.value.toLowerCase()
          if (
            (parsed.profile.full_name || '').toLowerCase().includes(q) ||
            (parsed.profile.phone || '').includes(memberQuery.value)
          ) {
            localResults.push(parsed.profile)
          }
        }
      }

      // Try Supabase search
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, city, avatar_url, role')
        .eq('role', 'craftsman')
        .or(`full_name.ilike.%${memberQuery.value}%,phone.ilike.%${memberQuery.value}%`)
        .neq('id', authStore.user?.id || '')
        .limit(6)

      const combined = data || localResults
      // Exclude already added members
      searchResults.value = combined.filter(u => !addedMembers.value.find(m => m.id === u.id))
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 400)
}

function addMember(user) {
  if (!addedMembers.value.find(m => m.id === user.id)) {
    addedMembers.value.push(user)
  }
  memberQuery.value = ''
  searchResults.value = []
}

function removeMember(id) {
  addedMembers.value = addedMembers.value.filter(m => m.id !== id)
}

function copyInviteLink() {
  const link = `${window.location.origin}/brigades?invite=join`
  navigator.clipboard.writeText(link).catch(() => {})
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2500)
}

const form = ref({
  name: '',
  leaderName: authStore.profile?.full_name || '',
  leaderPhone: authStore.profile?.phone || '',
  city: 'Toshkent',
  teamSize: 6,
  specialties: ['G\'isht teruvchi', 'Suvoqchi & Malyar'],
  priceRate: '',
  description: ''
})

function toggleSpecialty(tag) {
  if (form.value.specialties.includes(tag)) {
    form.value.specialties = form.value.specialties.filter(t => t !== tag)
  } else {
    form.value.specialties.push(tag)
  }
}

function handleCreateBrigade() {
  saving.value = true

  const newBrigade = {
    id: 'brigade_' + Date.now(),
    name: form.value.name,
    leaderName: form.value.leaderName,
    leaderPhone: form.value.leaderPhone,
    city: form.value.city,
    experienceYears: 8,
    rating: 5.0,
    reviewsCount: 1,
    teamSize: form.value.teamSize,
    completedProjects: 0,
    priceRate: form.value.priceRate || 'Kelishuv asosida',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
    description: form.value.description,
    specialties: form.value.specialties,
    members: [
      ...form.value.specialties.map(s => ({
        role: s,
        count: Math.max(1, Math.floor(form.value.teamSize / form.value.specialties.length)),
        icon: '👷'
      })),
      ...addedMembers.value.map(m => ({
        role: m.full_name,
        count: 1,
        icon: '👤',
        userId: m.id
      }))
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80'
    ]
  }

  // Save to local storage
  const localList = JSON.parse(localStorage.getItem('nexsora_custom_brigades') || '[]')
  localList.unshift(newBrigade)
  localStorage.setItem('nexsora_custom_brigades', JSON.stringify(localList))

  setTimeout(() => {
    saving.value = false
    toast.success("Brigada ro'yxatdan o'tkazildi", `«${newBrigade.name}» jamoasi muvaffaqiyatli tuzildi!`)
    emit('created', newBrigade)
    emit('close')
  }, 400)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 28px 32px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-box-gradient {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(245, 158, 11, 0.35);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-text);
}

.modal-subtitle {
  font-size: 0.82rem;
  color: var(--color-muted);
  margin: 3px 0 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-2);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.select-clean {
  padding: 11px 14px;
  border-radius: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.specialties-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pick-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-pick-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.tag-pick-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.btn-submit-brigade {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border-color: transparent;
  font-weight: 700;
}

/* Member Search */
.member-search-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 16px;
  gap: 12px;
}

.member-search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-inner {
  position: absolute;
  left: 12px;
  color: var(--color-muted);
  pointer-events: none;
}

.member-search-input {
  padding-left: 36px !important;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  background: var(--color-card);
}

.search-result-item:hover {
  background: var(--color-surface-2);
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.result-info strong {
  font-size: 0.88rem;
  color: var(--color-text);
}

.result-info span {
  font-size: 0.74rem;
  color: var(--color-muted);
}

.add-member-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary-light);
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.2);
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
}

.add-member-btn:hover {
  background: rgba(108, 99, 255, 0.2);
}

.search-empty, .search-loading {
  font-size: 0.8rem;
  color: var(--color-muted);
  padding: 8px 4px;
}

.added-members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.added-members-label {
  width: 100%;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-2);
}

.added-member-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(108, 99, 255, 0.12);
  border: 1px solid rgba(108, 99, 255, 0.25);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px 4px 12px;
  border-radius: 999px;
}

.chip-remove {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  display: flex;
  padding: 0;
}

.chip-remove:hover {
  color: var(--color-error);
}

.invite-link-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text-2);
  padding-top: 8px;
  border-top: 1px dashed var(--color-border);
}

.copy-link-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-primary-light);
  transition: all 0.15s;
}

.copy-link-btn:hover {
  background: rgba(108, 99, 255, 0.1);
  border-color: var(--color-primary);
}
</style>
