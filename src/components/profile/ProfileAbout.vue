<template>
  <div class="card about-card">
    <div class="about-card-header">
      <h3 class="section-heading" style="margin-bottom: 0">
        <User :size="18" /> O'zi haqida
      </h3>
      <button
        v-if="isOwnProfile && !isEditingBio"
        class="btn btn-ghost btn-sm edit-bio-btn"
        @click="startEditBio"
      >
        <Edit3 :size="14" />
        <span>{{ (bioText) ? 'Tahrirlash' : 'Ma\'lumot kiritish' }}</span>
      </button>
    </div>

    <!-- Inline Bio Edit Mode -->
    <div v-if="isEditingBio" class="bio-edit-form">
      <textarea
        v-model="localBioText"
        class="textarea bio-textarea"
        rows="4"
        placeholder="O'zingiz, faoliyatingiz, tajribangiz yoki xizmatlaringiz haqida qisqacha ma'lumot yozing..."
      />
      <div class="bio-edit-actions">
        <button class="btn btn-secondary btn-sm" @click="isEditingBio = false" :disabled="savingBio">
          Bekor qilish
        </button>
        <button class="btn btn-primary btn-sm" @click="handleSaveBio" :disabled="savingBio">
          <span v-if="savingBio" class="animate-spin loader-sm"></span>
          <template v-else>
            <Save :size="14" /> Saqlash
          </template>
        </button>
      </div>
    </div>

    <!-- Bio Display Mode -->
    <template v-else>
      <p v-if="bioText" class="bio-text">
        {{ bioText }}
      </p>
      <div v-else class="empty-bio-box">
        <p class="empty-text" style="margin-bottom: 0">
          Ma'lumot kiritilmagan.
        </p>
        <button v-if="isOwnProfile" class="btn btn-secondary btn-sm" style="margin-top: 8px" @click="startEditBio">
          <Plus :size="14" /> O'zingiz haqingizda ma'lumot yozing
        </button>
      </div>
    </template>

    <!-- Specialties (For Craftsman) -->
    <div v-if="isCraftsman" class="specialties-section">
      <h4 style="font-size: 0.95rem; margin: 18px 0 10px; color: var(--color-text)">
        Mutaxassislik yo'nalishlari
      </h4>
      <div v-if="specialties.length > 0" class="specialty-chips-wrap">
        <span v-for="cat in specialties" :key="cat" class="skill-chip">
          <Wrench :size="13" /> {{ cat }}
        </span>
      </div>
      <div v-else class="empty-text">Mutaxassislik tanlanmagan</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { User, Edit3, Save, Plus, Wrench } from 'lucide-vue-next'

const props = defineProps({
  bioText: { type: String, default: '' },
  isOwnProfile: { type: Boolean, default: false },
  isCraftsman: { type: Boolean, default: false },
  specialties: { type: Array, default: () => [] },
  savingBio: { type: Boolean, default: false }
})

const emit = defineEmits(['save-bio'])

const isEditingBio = ref(false)
const localBioText = ref(props.bioText || '')

watch(() => props.bioText, (newVal) => {
  localBioText.value = newVal || ''
})

function startEditBio() {
  localBioText.value = props.bioText || ''
  isEditingBio.value = true
}

function handleSaveBio() {
  emit('save-bio', {
    text: localBioText.value,
    done: () => {
      isEditingBio.value = false
    }
  })
}
</script>

<style scoped>
.about-card {
  padding: 24px;
}

.about-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.bio-text {
  color: var(--color-text-2);
  line-height: 1.6;
  white-space: pre-line;
}

.empty-bio-box {
  padding: 16px 0;
}

.empty-text {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.bio-edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bio-textarea {
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: inherit;
  resize: vertical;
}

.bio-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.specialty-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid rgba(108, 99, 255, 0.25);
  color: var(--color-primary-light);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
}
</style>
