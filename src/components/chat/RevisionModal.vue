<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-dialog review-modal-dialog">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon-badge revision-badge">
              <RotateCcw :size="22" />
            </div>
            <div>
              <h3 class="modal-heading">Ishni qayta ishlash / Tuzatishni so'rash</h3>
              <p class="modal-subtitle">
                Usta: <strong>{{ partnerName || 'Usta' }}</strong>
              </p>
            </div>
          </div>
          <button class="modal-close-btn" @click="$emit('close')" title="Yopish">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <!-- Job Summary Card -->
          <div class="modal-job-summary">
            <div class="summary-label">E'lon / Buyurtma:</div>
            <div class="summary-title">{{ job?.title }}</div>
          </div>

          <div class="revision-notice-box">
            <AlertCircle :size="18" class="flex-shrink-0" />
            <span>Agar usta bajargan ishda kamchiliklar bo'lsa yoki talabingizga to'liq mos kelmasa, tuzatilishi kerak bo'lgan joylarni yozing. Usta bu so'rovni ko'rib, ishni to'g'irlab qayta topshiradi.</span>
          </div>

          <!-- Quick Reason Chips -->
          <div class="tags-section">
            <label class="section-label">Asosiy sabablar (bir yoki bir nechtasini tanlang):</label>
            <div class="tags-wrap">
              <button
                v-for="tag in revisionQuickTags"
                :key="tag"
                type="button"
                class="tag-chip"
                :class="{ active: selectedTags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- Detailed Explanation Textarea -->
          <div class="comment-section">
            <label class="section-label">Ustaga batafsil ko'rsatmalar *:</label>
            <textarea
              v-model="comment"
              class="modal-textarea"
              rows="4"
              placeholder="Ustaga aynan qaysi joylarni to'g'irlashi kerakligini aniq va muloyim tushuntiring..."
            />
          </div>

          <div v-if="error" class="modal-error-box">
            <AlertCircle :size="16" />
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="submitting"
            @click="$emit('close')"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            class="btn btn-warning submit-revision-btn"
            :disabled="submitting || (!comment.trim() && selectedTags.length === 0)"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="animate-spin loader"></span>
            <template v-else>
              <RotateCcw :size="16" />
              <span>Ustaga qayta ishlash so'rovini yuborish</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RotateCcw, X, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  partnerName: String,
  job: Object,
  submitting: Boolean,
  error: String
})

const emit = defineEmits(['close', 'submit'])

const comment = ref('')
const selectedTags = ref(['🛠 Kamchiliklar to\'liq tuzatilmagan'])

const revisionQuickTags = [
  '🛠 Kamchiliklar to\'liq tuzatilmagan',
  '📐 O\'lcham yoki montajda xatolik bor',
  '🧹 Tozalik va tartibga e\'tibor berilmagan',
  '⏱ Ish to\'liq yakuniga yetmagan',
  '💡 Kelishilgan talablarga mos kelmadi',
  '⚙️ Qayta tekshirish talab etiladi'
]

watch(() => props.show, (newVal) => {
  if (newVal) {
    comment.value = ''
    selectedTags.value = ['🛠 Kamchiliklar to\'liq tuzatilmagan']
  }
})

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

function handleSubmit() {
  emit('submit', {
    comment: comment.value,
    selectedTags: selectedTags.value
  })
}
</script>
