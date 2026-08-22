<template>
  <div class="admin-card card">
    <div class="card-header-clean">
      <div>
        <h3>🏅 Ustalarni Tasdiqlash & KYC So'rovlari</h3>
        <p>Hujjatlari tekshirilgan ustalarga «Tasdiqlangan Usta» ko'k nishoni beriladi</p>
      </div>
      <span class="badge badge-info">{{ verificationsList.length }} ta ariza</span>
    </div>

    <div class="verifications-grid">
      <div v-for="craftsman in verificationsList" :key="craftsman.id" class="verif-card">
        <div class="verif-top">
          <div class="avatar-box">
            <img v-if="craftsman.avatar" :src="craftsman.avatar" class="avatar-img" />
            <span v-else class="avatar-fallback">{{ craftsman.name.slice(0, 2) }}</span>
          </div>
          <div class="verif-info">
            <div class="verif-name-row">
              <h4>{{ craftsman.name }}</h4>
              <span v-if="craftsman.is_verified" class="verified-badge-pill">
                <BadgeCheck :size="14" /> Tasdiqlangan
              </span>
            </div>
            <p class="verif-cat">{{ craftsman.category }} • {{ craftsman.experience }} yillik tajriba</p>
            <div class="verif-contacts">
              <span class="contact-pill"><Phone :size="13" /> {{ craftsman.phone }}</span>
              <span class="contact-pill"><MapPin :size="13" /> {{ craftsman.city }}</span>
            </div>
          </div>
        </div>

        <div class="verif-docs-box">
          <span class="docs-label">Yuklangan Hujjatlar:</span>
          <div class="docs-tags-row">
            <div class="doc-badge">
              <FileText :size="14" />
              <span>Pasport / ID karta</span>
            </div>
            <div class="doc-badge">
              <Award :size="14" />
              <span>Diplom / Sertifikat</span>
            </div>
          </div>
        </div>

        <div class="verif-actions">
          <button
            v-if="!craftsman.is_verified"
            class="btn btn-primary btn-sm btn-action-main"
            @click="$emit('approve-craftsman', craftsman)"
          >
            <BadgeCheck :size="16" />
            <span>Tasdiqlash & Nishon berish</span>
          </button>
          <button
            v-else
            class="btn btn-secondary btn-sm btn-action-main"
            @click="$emit('revoke-craftsman', craftsman)"
          >
            <X :size="15" />
            <span>Tasdiqni bekor qilish</span>
          </button>
          <router-link :to="`/profile/${craftsman.id}`" class="btn btn-ghost btn-sm">
            Profilni ko'rish
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BadgeCheck, Phone, MapPin, FileText, Award, X } from 'lucide-vue-next'

defineProps({
  verificationsList: { type: Array, required: true }
})

defineEmits(['approve-craftsman', 'revoke-craftsman'])
</script>

<style scoped>
.admin-card {
  padding: 28px;
  border-radius: 20px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header-clean {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-header-clean h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.card-header-clean p {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin: 4px 0 0;
}

.verifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.verif-card {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s ease;
}

.verif-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.verif-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.avatar-box {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
}

.verif-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.verif-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.verif-name-row h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.verified-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
}

.verif-cat {
  font-size: 0.82rem;
  color: var(--color-primary-light);
  font-weight: 600;
  margin: 0;
}

.verif-contacts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.contact-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.76rem;
  color: var(--color-muted);
}

.verif-docs-box {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.docs-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-muted);
  text-transform: uppercase;
}

.docs-tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.doc-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-surface-2);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.verif-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
}

.btn-action-main {
  flex: 1;
}
</style>
